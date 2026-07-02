---
title: "DINOv2: 텍스트 없이 만든 비전 파운데이션 모델"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 자기지도학습
tags: ["컴퓨터 비전", "Meta AI", "DINOv2", "자기지도학습", "파운데이션 모델", "데이터셋"]
paper: "DINOv2: Learning Robust Visual Features without Supervision"
paperUrl: "https://arxiv.org/abs/2304.07193"
authors: "Maxime Oquab, Timothée Darcet, Théo Moutakanni, et al. (Meta AI Research)"
venue: "TMLR"
year: 2024
references: ["dino", "mae", "vit"]
description: 12억 장의 웹 이미지에서 검색 기반으로 큐레이션한 LVD-142M 위에, DINO(이미지 수준)와 iBOT(패치 수준 마스킹) 손실을 결합해 1.1B ViT-g를 학습하고 소형 모델로 증류한다. frozen feature만으로 OpenCLIP을 넘는, 텍스트 감독 없는 범용 시각 backbone을 실증했다.
---

## 한 줄 요약

CLIP 이후 "범용 시각 특징은 텍스트 감독(캡션)에서 나온다"는 것이 통념이 됐다. DINOv2는 그 반례다 — **큐레이션된 대규모 이미지 데이터(LVD-142M) + DINO/iBOT 결합 손실 + 스케일링 공학 + 증류**만으로, 미세조정 없이 frozen으로 쓰는 특징이 linear/k-NN/dense 태스크 전반에서 OpenCLIP을 넘는다. "자기지도만으로 파운데이션 모델이 된다"의 실증.

## 핵심 기여

- **데이터 큐레이션이 1급 기여**: 비큐레이션 웹 이미지 1.2B 장에서 시작해, 중복 제거 후 **큐레이션된 시드 데이터셋(ImageNet-22k, 랜드마크, 세분류 데이터 등)과 유사한 이미지를 검색으로 회수**한다 — 자기지도 임베딩 + k-means로 시드당 최근접 이미지들을 모아 LVD-142M을 구성(160 GPU 이틀). 라벨은 안 쓰지만 "무엇이 좋은 분포인가"는 시드로 주입하는, 자기지도 시대의 데이터 설계 청사진이다.

- **손실 결합 — 두 갈래의 하이브리드**: 이미지 수준의 DINO 손실(class 토큰 자기증류)에 **iBOT의 패치 수준 masked prediction 손실**을 더한다 — 자기증류 계열과 예측(MIM) 계열의 결합으로, 전역 의미와 국소 구조를 함께 잡는다. 세부 개선: 두 손실의 projection head 분리(공유보다 나음), 교사 정규화를 Sinkhorn-Knopp centering으로 교체, 특징이 공간에 고르게 퍼지도록 최근접 거리의 로그를 벌주는 **KoLeo 정규화** $-\frac{1}{n}\sum_i \log d_{n,i}$, 마지막 10k 스텝만 518px 고해상도 학습(비용은 낮게, dense 성능은 높게).

- **스케일링 공학**: 커스텀 FlashAttention, 가변 크기 crop들을 블록 대각 마스크로 이어붙이는 sequence packing, stochastic depth에서 드롭된 residual 계산 자체를 건너뛰기, FSDP — iBOT 구현 대비 **2배 빠르고 메모리 1/3**. ViT-g/14(1.1B, 임베딩 1536)를 이 위에서 학습했다.

- **증류로 패밀리 완성**: ViT-S/B/L은 처음부터 학습하지 않고 **frozen ViT-g를 교사로 증류** — 같은 크기를 scratch로 학습한 것보다 12개 벤치마크에서 일관되게 좋다. "큰 모델 하나 잘 만들고 줄여서 배포"라는 LLM식 운영이 비전 SSL에 들어온 것.

## 주요 결과

- ImageNet-1k linear: ViT-g **86.5%**(OpenCLIP ViT-G 86.2%), k-NN **83.5%**(iBOT 72.9%), 미세조정 시 88.9%(sanity check).
- **Dense 태스크에서 격차가 크다**: ADE20K linear 49.0 mIoU, NYUd 깊이 RMSE 0.279, Oxford-Hard 검색 52.3 mAP(iBOT 12.7) — 패치 수준 손실과 고해상도 마무리의 효과.
- 강건성: ImageNet-A 75.9%(iBOT 대비 +29.6%p), Sketch 62.5% — 데이터 규모·다양성의 이득.
- 세분류 12개 평균 92.1%로 OpenCLIP(91.9%)과 대등 이상 — 텍스트 감독의 아성이던 영역까지.

## 계보에서의 위치

[DINO](/papers/dino/)의 "frozen으로 쓰는 표현"이라는 강점을 [MAE](/papers/mae/)/iBOT 계열의 패치 손실과 결합하고, 방법보다 **데이터와 공학**으로 승부를 본 스케일업이다 — [자기지도학습 세 갈래](/insight/self-supervised-learning/)가 하이브리드로 수렴한다는 정리의 실례. CLIP 노선과의 관계가 핵심 관전 포인트다: 언어 정렬이 필요한 곳(제로샷 분류, 검색)은 CLIP이, 시각 구조 자체가 필요한 곳(깊이, 분할, 대응)은 DINOv2가 — 이 분업은 이후 멀티모달 시스템들이 두 인코더를 함께 쓰는 관행으로 이어진다. DINOv3는 이 노선을 더 큰 데이터와 모델로 밀어붙이며 dense 특징의 품질 문제를 정면으로 다룬다.
