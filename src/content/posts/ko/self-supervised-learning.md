---
title: "자기지도학습의 세 갈래: 예측, 대조, 자기증류"
date: 2026-07-02
draft: false
category: 개념 정리
tags: ["컴퓨터 비전", "머신 러닝", "자기지도학습", "표현 학습"]
description: 라벨 없이 표현을 배우는 자기지도학습을 세 계열로 정리한다 — 가려진 것을 맞히는 예측(MAE), 같은 것끼리 당기고 다른 것끼리 미는 대조 학습(SimCLR), 그리고 negative 없이 교사-학생의 출력을 맞추는 자기증류(BYOL/DINO). 각 계열이 붕괴(collapse)를 어떻게 피하는지가 핵심 축이다.
tldr:
  - 자기지도학습의 본질은 "데이터 스스로가 라벨"이 되는 pretext 태스크 설계이고, 계열을 가르는 기준은 붕괴를 막는 방식이다.
  - 예측 계열(MAE)은 입력 일부를 가리고 복원한다 — 붕괴 문제가 아예 없다. 대조 계열(SimCLR)은 negative pair로, 자기증류 계열(DINO)은 비대칭 구조(EMA 교사, centering)로 붕괴를 막는다.
  - NLP는 예측(BERT/GPT)으로 일찍 수렴했지만, 비전은 세 갈래가 각축을 벌이다 DINO 계열이 범용 backbone 자리를 가져갔다.
prerequisites:
  - CNN/ViT 등 비전 backbone에 대한 기본 이해
---

## 라벨 없이 배운다는 것

ImageNet 1,400만 장에 라벨을 붙이는 데 들어간 인력을 웹의 수십억 장 이미지에 다시 쓸 수는 없다. 자기지도학습(SSL)은 라벨 대신 **데이터 자신의 구조**에서 감독 신호를 만든다 — 입력의 일부로 다른 일부를 설명하게 하는 pretext 태스크를 풀게 하고, 그 과정에서 생긴 표현을 다운스트림에 전이한다. NLP에서는 이 아이디어가 언어 모델링([GPT-1](/papers/gpt-1/))과 마스킹([BERT](/papers/bert/))으로 일찍 정리됐지만, 비전은 사정이 달랐다. 이미지는 이산 토큰이 아니라 연속·고차원·저의미밀도 신호라서 "무엇을 맞히게 할 것인가"부터가 문제였고, 그 답에 따라 세 계열이 갈라졌다.

세 계열을 관통하는 평가 축은 하나다: **표현 붕괴(collapse)를 어떻게 막는가.** 모든 입력에 같은 벡터를 내놓으면 대부분의 자기지도 목적함수가 자명하게 최소화된다. 이 자명해를 배제하는 방식이 곧 계열의 정체성이다.

## 1. 예측 (predictive / generative) — 가린 것을 맞혀라

입력의 일부를 지우고 나머지로 복원하게 한다. 초기의 색칠(colorization), 퍼즐(jigsaw), 회전 예측 같은 수공예 pretext를 거쳐, BERT의 성공을 비전에 이식한 **Masked Image Modeling**으로 수렴했다. 대표가 [MAE](/papers/mae/)다: 패치의 75%를 지우고 픽셀을 직접 회귀한다.

- **붕괴 문제가 구조적으로 없다.** 타깃(가려진 픽셀/토큰)이 입력마다 다르므로 상수 출력은 답이 될 수 없다. negative pair도, EMA 교사도, 정교한 증강도 필요 없다.
- 대신 **무엇을 복원 타깃으로 삼느냐**가 설계의 전부다 — 픽셀(MAE), 이산 visual token(BEiT), HOG 특징 등. 픽셀 복원은 저수준 통계에 치우칠 위험이 있지만 MAE는 높은 마스킹 비율로 이를 상쇄한다.
- 특성: 미세조정하면 매우 강하지만, 표현을 그대로 쓰는 linear probing / k-NN 성능은 대조·증류 계열보다 약한 경향이 있다 — 복원에 필요한 정보와 판별에 필요한 정보가 같지 않기 때문이다.

## 2. 대조 학습 (contrastive) — 같은 것은 당기고 다른 것은 밀어라

같은 이미지의 두 증강본(positive pair)은 가깝게, 배치 내 다른 이미지들(negatives)은 멀게 임베딩한다. 표준 목적함수는 InfoNCE:

$$\mathcal{L}_{i,j} = -\log \frac{\exp(\text{sim}(z_i, z_j)/\tau)}{\sum_{k \neq i} \exp(\text{sim}(z_i, z_k)/\tau)}$$

- **붕괴는 negative가 막는다** — 모두 같은 점으로 모이면 분모가 커져 손실이 오르므로, 표현이 구 위에 고르게 퍼진다(uniformity)와 positive 정렬(alignment)의 균형으로 해석된다.
- 대표가 [SimCLR](/papers/simclr/) — "특별한 구조 없이 증강 조합 + 큰 배치 + projection head면 된다"는 미니멀리즘. MoCo는 negative를 배치 대신 momentum 큐로 공급해 배치 크기 제약을 풀었다.
- 약점도 negative에서 나온다: 수천 규모의 negative가 필요해 배치/메모리 요구가 크고, 증강 설계에 민감하며, 같은 클래스의 이미지가 negative로 밀리는 false negative 문제가 본질적으로 남는다.

## 3. 자기증류 (self-distillation) — negative 없이, 나의 과거가 교사

같은 이미지의 두 뷰를 학생과 교사에 넣고, 학생이 교사의 출력을 맞히게 한다. 교사는 별도 모델이 아니라 **학생 가중치의 EMA(exponential moving average)** — 자기 자신의 느린 버전이다. BYOL이 "negative 없이도 된다"를 처음 보였고, [DINO](/papers/dino/)가 이를 ViT + centering/sharpening으로 다듬었다.

- negative가 없으므로 붕괴가 정면 문제다. 이를 **비대칭성**으로 막는다: 교사-학생의 구조적 비대칭(predictor head, stop-gradient), EMA로 느리게 움직이는 교사, DINO의 경우 교사 출력에 centering(한 차원 지배 방지) + sharpening(균등분포 붕괴 방지)의 상반된 두 연산.
- 이론적으로는 가장 "왜 되는지" 설명이 덜 된 계열이지만, 실전 결과가 계보를 정리했다 — DINO의 표현은 k-NN만으로 강력하고, attention map에 무감독 분할이 창발하며, DINOv2/v3에 이르러 미세조정 없이 쓰는 범용 시각 backbone이 됐다.

## 어느 갈래가 이겼나

NLP는 예측 계열의 완승으로 일찍 끝났다(자기회귀와 마스킹). 비전은 2020~2022년에 세 갈래가 각축을 벌였는데, 지금 시점의 정리는 대략 이렇다: **미세조정 전제라면 MAE류**(특히 검출/분할로의 전이), **frozen feature 전제라면 DINO류**(k-NN, linear probing, dense task), 순수 대조 계열은 단독으로는 밀렸지만 InfoNCE라는 목적함수 자체는 [CLIP](/papers/clip/)의 이미지-텍스트 대조로 옮겨가 멀티모달의 표준이 됐다. 실제로 DINOv2가 iBOT의 마스킹 예측 손실을 흡수했듯, 최신 시스템들은 계열 간 하이브리드다 — 세 갈래는 경쟁 관계라기보다 서로 다른 정보(저수준 구조 / 인스턴스 판별 / 의미적 군집)를 뽑는 상보적 도구로 수렴하는 중이다.
