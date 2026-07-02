---
title: "SimCLR: 대조 학습에는 트릭이 아니라 조합이 필요하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 자기지도학습
tags: ["컴퓨터 비전", "머신 러닝", "ICML", "Google Research", "SimCLR", "대조 학습", "자기지도학습"]
paper: "A Simple Framework for Contrastive Learning of Visual Representations"
paperUrl: "https://arxiv.org/abs/2002.05709"
authors: "Ting Chen, Simon Kornblith, Mohammad Norouzi, Geoffrey Hinton"
venue: "ICML"
year: 2020
references: ["resnet"]
description: 메모리 뱅크나 특수 구조 없이 — 강한 증강 조합, ResNet 인코더, projection head, NT-Xent 손실, 큰 배치 — 만으로 대조 학습의 SOTA를 크게 끌어올린 프레임워크. linear evaluation에서 ResNet-50(4×) 76.5%로 지도학습 베이스라인과 대등해졌다.
---

## 한 줄 요약

대조 학습의 선행 연구들이 메모리 뱅크와 특수 아키텍처를 쌓아가던 시점에, SimCLR은 "**필요한 건 재료의 올바른 조합뿐**"임을 보였다 — 강한 증강 조합, 표준 ResNet, 2층 MLP projection head, 온도 스케일 대조 손실, 큰 배치. 저자들 스스로 "각 부품은 전부 기존 것"이라 말한다. 이 조합으로 linear evaluation 기준 자기지도 표현이 처음으로 지도학습 ResNet-50과 대등해졌다(76.5%).

## 핵심 기여

- **프레임워크**: 이미지 하나에 독립적인 증강 $t, t' \sim \mathcal{T}$를 적용해 두 뷰(positive pair)를 만들고, 인코더 $h = f(x)$ (ResNet-50, 2048-d) → projection head $z = g(h) = W^{(2)}\sigma(W^{(1)}h)$ (128-d) 후 NT-Xent 손실을 최소화한다.

$$\ell_{i,j} = -\log \frac{\exp(\text{sim}(z_i, z_j)/\tau)}{\sum_{k=1}^{2N} \mathbb{1}_{[k \neq i]} \exp(\text{sim}(z_i, z_k)/\tau)}$$

  배치 $N$에서 증강본 $2N$개가 나오고, positive 하나당 나머지 $2(N-1)$개가 전부 negative — 별도 negative 샘플링이 없다.

- **증강은 조합이 전부**: 단일 증강으로는 어떤 것도 충분치 않고, **random crop + color distortion**의 조합이 결정적이다. 이유가 선명하다 — crop만 쓰면 같은 이미지의 두 crop이 색 히스토그램만으로 매칭되는 지름길이 생기므로, 색을 흔들어 지름길을 막아야 모델이 구조를 본다. 또 하나의 발견: **자기지도는 지도학습보다 더 강한 증강을 원한다**(지도학습에선 해로운 증강 강도가 대조 학습에선 이득).

- **Projection head의 역설**: 다운스트림에는 projection 출력 $z$가 아니라 그 **앞의** $h$를 써야 한다 — 10%p 이상 차이. 대조 손실은 증강에 불변인 표현을 요구하므로 $g$가 색·방향 같은 정보를 **지워버리는데**(색상 예측 정확도 $h$ 99.3% vs $g(h)$ 97.4%), 그 정보가 다운스트림에는 유용하기 때문. "손실이 최적화되는 공간과 표현을 꺼내는 공간을 분리한다"는 이 설계는 이후 모든 SSL의 표준이 됐다.

- **스케일 요구**: negative가 배치에서 나오므로 배치가 곧 성능 — 256→4096/8192로 키울수록 좋고, LARS 옵티마이저와 디바이스 간 BN 통계 집계(정보 누출 방지)가 필요하다. 학습도 길수록 좋다(100→1000에폭). 손실 자체의 ablation도 철저하다: NT-Xent 63.9% vs triplet 50.9%, $\ell_2$ 정규화와 $\tau \approx 0.1$이 없으면 대조 태스크 정확도는 높은데 표현 품질은 무너진다 — **pretext 태스크를 잘 푸는 것과 좋은 표현은 다르다**는 중요한 경고.

## 주요 결과

- ImageNet linear evaluation: ResNet-50 **69.3%**, 2× 74.2%, 4× **76.5%** — 지도학습 ResNet-50과 동급. 이전 SOTA 대비 +7%p급 도약.
- 준지도: 라벨 1%만으로 미세조정 시 top-5 85.8%(4×) — 종전 대비 상대 ~10% 개선.
- 12개 데이터셋 전이에서 지도 사전학습과 5승 5무 2패 — "라벨 없는 사전학습이 라벨 있는 것과 대등"의 실증.

## 계보에서의 위치

[자기지도학습의 세 갈래](/insight/self-supervised-learning/) 중 대조 계열의 대표작이자, 그 계열의 정점과 한계를 동시에 보여준 논문이다. 정점 — [ResNet](/papers/resnet/) 이후 정체됐던 "라벨 없는 표현 학습"을 지도학습과 대등한 수준으로 올렸다. 한계 — 수천 규모 배치라는 비용과 negative 의존이 곧바로 다음 질문을 낳았다: MoCo는 큐로 배치 제약을 풀었고, BYOL은 negative 자체를 제거했으며, 그 노선이 DINO의 자기증류로 이어진다. 한편 NT-Xent(InfoNCE) 손실 자체는 이미지-텍스트 쌍으로 무대를 옮겨 CLIP의 심장이 된다 — 손실은 살아남고 세팅이 바뀐 셈이다.
