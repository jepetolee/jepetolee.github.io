---
title: "SigLIP: softmax를 버리고 쌍별 sigmoid로 CLIP을 다시 학습하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전-언어 모델
tags: ["컴퓨터 비전", "자연어 처리", "ICCV", "Google DeepMind", "SigLIP", "대조 학습", "멀티모달"]
paper: "Sigmoid Loss for Language Image Pre-Training"
paperUrl: "https://arxiv.org/abs/2303.15343"
authors: "Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, Lucas Beyer"
venue: "ICCV"
year: 2023
references: ["clip", "vit"]
description: CLIP의 softmax 대조 손실을 이미지-텍스트 쌍마다 독립인 sigmoid 이진 분류로 바꿔, 배치 전체에 대한 전역 정규화와 그로 인한 메모리·통신 비용을 제거한다. 작은 배치에서 softmax를 크게 앞서고, TPUv4 4개·이틀 만에 ImageNet 제로샷 84.5%(SigLiT)를 달성했으며, 배치 100만까지 키워도 32k에서 포화함을 보였다.
---

## 한 줄 요약

CLIP의 softmax 대조 손실은 배치 전체의 유사도 행렬($|\mathcal{B}|^2$)을 정규화해야 해서 all-gather 통신과 메모리를 요구하고, 배치 크기가 손실의 정의 자체에 얽혀 든다. SigLIP은 이를 **쌍마다 독립적인 sigmoid 이진 분류**("이 이미지-텍스트 쌍이 진짜인가?")로 바꾼다 — 전역 정규화가 사라지니 구현이 단순해지고 메모리가 국소 배치에 선형이 되며, 작은 배치에서 오히려 더 잘 된다. 부산물로 "배치 100만이 필요한가?"라는 질문에도 답했다: **아니다, 32k면 포화한다.**

## 핵심 기여

- **Sigmoid 손실**: 모든 이미지-텍스트 쌍 조합에 대한 이진 분류로 문제를 재정의한다.

$$\mathcal{L} = -\frac{1}{|\mathcal{B}|} \sum_{i=1}^{|\mathcal{B}|} \sum_{j=1}^{|\mathcal{B}|} \log \frac{1}{1 + e^{z_{ij}(-t\, x_i \cdot y_j + b)}}$$

  $z_{ij}$는 짝이면 $+1$, 아니면 $-1$. 핵심 디테일이 **학습형 바이어스 $b$**다: positive 1개당 negative가 $|\mathcal{B}|-1$개라 초기 손실이 negative에 지배되는데, $t' = \log 10$, $b = -10$으로 초기화해 학습 시작점을 사전분포 근처로 맞춘다 — 이것이 없으면 초기에 대규모 과보정이 일어난다. softmax와 달리 손실이 대칭이라 이미지→텍스트/텍스트→이미지 두 번의 정규화도 필요 없다.

- **Chunked 구현**: 각 쌍이 독립 항이므로, 디바이스 $D$개에 데이터 병렬로 나눈 뒤 **이웃 디바이스와 negative만 순환 교환**하며 부분 손실을 누적하면 된다 — all-gather 없이, 메모리는 $|\mathcal{B}|^2$에서 디바이스당 $b^2 = (|\mathcal{B}|/D)^2$로. 이 구현 덕에 비교적 적은 칩으로 배치 100만 학습까지 가능했다.

- **배치 크기 연구**: 배치 16k 미만에서는 sigmoid가 softmax를 큰 폭으로 이기고, 커질수록 격차가 줄어 대등해진다. SigLIP은 32k에서 최적(softmax는 98k 필요), **둘 다 32k 근처에서 포화**하고 307k는 오히려 해롭다 — "대조 학습은 배치가 클수록 좋다"는 통념의 정량적 반박. 다국어(mSigLIP, 100개 언어)에서도 32k면 충분했다.

## 주요 결과

- **SigLiT**(frozen 이미지 타워 + 텍스트만 학습): TPUv4 **4개로 하루** 만에 ImageNet 제로샷 79.7%, g/14 체크포인트로 **이틀에 84.5%** — CLIP(V100 256장 12일)과 대비되는 접근성.
- **SigLIP**(WebLI에서 from scratch, B/16): 16 TPUv4 3일에 71.0%, 32칩 5일에 73.4% — 같은 자원의 softmax CLIP 베이스라인을 상회. TPUv4 4칩 기준 배치 4096을 실을 수 있는데 CLIP 구현은 2048에 그친다.
- mSigLIP은 XM3600 다국어 텍스트→이미지 검색에서 Base 크기로 34.9% — 40억 파라미터 ViT-e 기반 종전 기록(28.5%)을 +6%p 경신.
- 대배치 학습 안정성 분석(AdaFactor/Adam의 $\beta_2$를 0.95로 낮춰 그래디언트 스파이크 억제), positive/negative 비율 ablation 등 실무 디테일이 충실하다.

## 계보에서의 위치

[CLIP](/papers/clip/)이 연 이미지-텍스트 대조 사전학습을 **손실 함수 수준에서 재설계**해 접근성과 효율을 끌어올린 후속이다. "softmax의 배치 결합은 본질인가"라는 질문에 "아니다"라고 답했고, 그 단순함 덕에 SigLIP(및 후속 SigLIP 2)은 오픈 생태계에서 CLIP의 실질적 후계자가 됐다 — PaliGemma를 비롯한 최근 멀티모달 LLM들의 비전 인코더 기본값이 SigLIP 계열이라는 것이 그 증거다. 비전 자기지도의 [DINOv3](/papers/dinov3/)와 함께, "frozen 비전 인코더 + 무엇을 정렬할 것인가"라는 현재 멀티모달 스택의 양대 축을 이룬다.
