---
title: "DINO: 라벨 없는 자기증류에서 분할이 창발하다"
date: 2026-07-02
draft: true
category: 컴퓨터 비전
subcategory: 자기지도학습
tags: ["컴퓨터 비전", "ICCV", "Meta AI", "DINO", "자기지도학습", "자기증류", "Transformer"]
paper: "Emerging Properties in Self-Supervised Vision Transformers"
paperUrl: "https://arxiv.org/abs/2104.14294"
authors: "Mathilde Caron, Hugo Touvron, Ishan Misra, Hervé Jégou, Julien Mairal, Piotr Bojanowski, Armand Joulin"
venue: "ICCV"
year: 2021
references: ["vit", "simclr", "deit"]
description: 학생과 EMA 교사 간 교차엔트로피를 최소화하는 라벨 없는 자기증류(DINO)로 ViT를 학습하면, self-attention 맵에 물체 경계가 명시적으로 창발하고 k-NN만으로 ImageNet 78.3%를 찍는 표현이 나온다. 붕괴는 negative 없이 교사 출력의 centering과 sharpening의 균형만으로 막는다.
---

## 한 줄 요약

자기지도로 학습한 ViT에서는 지도학습에서 보이지 않던 두 가지가 **창발**한다 — `[CLS]` 토큰의 self-attention 맵이 물체 경계를 그리고(사실상 무감독 분할), frozen feature의 k-NN 분류만으로 ImageNet 78.3%가 나온다. 방법은 라벨 없는 자기증류: 학생이 자기 가중치의 EMA인 교사의 출력을 맞히되, negative도 predictor도 BN도 없이 **centering과 sharpening의 균형**만으로 붕괴를 막는다.

## 핵심 기여

- **자기증류 프레임**: 같은 구조의 학생 $\theta_s$와 교사 $\theta_t$를 두고, 이미지의 서로 다른 뷰에 대해 교차엔트로피 $H(P_t(x), P_s(x'))$를 최소화한다(교사에는 stop-gradient). 교사는 학습되지 않고 **학생의 EMA**로 갱신된다: $\theta_t \leftarrow \lambda \theta_t + (1-\lambda)\theta_s$ ($\lambda$: 0.996→1 cosine). 흥미로운 관찰 — 학습 내내 **교사가 학생보다 좋다**(Polyak-Ruppert 평균 = 모델 앙상블 효과). 좋은 교사가 좋은 타깃을 주는 선순환이 이 방법의 동력이다.

- **Multi-crop과 local-to-global**: 전역 뷰 2개(224², 이미지의 >50%)는 양쪽에, 국소 뷰 여러 개(96², <50%)는 학생에만 넣어 "부분을 보고 전체의 표현을 맞히는" 대응을 강제한다. ablation에서 +4~5%p — 핵심 재료다.

- **붕괴 방지 — 두 힘의 균형**: negative 없이 붕괴를 막는 장치가 우아하다. 교사 로짓에서 배치 러닝 평균을 빼는 **centering**은 한 차원의 지배를 막지만 균등분포 붕괴를 부추기고, 낮은 교사 온도($\tau_t = 0.04{\sim}0.07$)의 **sharpening**은 균등분포를 막지만 차원 지배를 부추긴다 — 서로의 실패 모드를 상쇄한다. $H(P_t, P_s) = h(P_t) + D_{KL}(P_t \| P_s)$ 분해로 보면, 어느 한쪽만 빼도 KL이 0으로 붕괴한다. BYOL의 predictor(여기선 +0.2%p로 무의미)도, 대조 손실도, BN도 필요 없다 — 시스템 전체가 BN-free다.

- **왜 ViT와 시너지인가**: 패치를 8×8로 줄이면(ViT-S/8) 파라미터 증가 없이 k-NN이 ~4%p 오른다. attention 맵의 분할 창발도 ViT 고유 — 지도학습 ViT의 attention은 이 구조를 보여주지 않는다(VOC12 Jaccard 45.9 vs 지도 27.3).

## 주요 결과

- **k-NN(frozen)**: ViT-S/8 **78.3%** — 미세조정도 선형층도 없이. 대조 계열은 k-NN과 linear의 격차가 큰데 DINO는 거의 없다.
- Linear probing: ViT-B/8 **80.1%**, ResNet-50 75.3%(당시 SSL SOTA와 동급) — 방법이 아키텍처를 안 가린다.
- DAVIS-2017 비디오 물체 분할 71.4(J&F, 미세조정 없음), Oxford/Paris 검색에서 기존 방법 상회 — dense한 공간 정보가 표현에 살아 있다는 증거.
- 비용: ViT-S/16 기준 V100 16장 × 72시간, 배치 128까지 줄여도 동작 — SimCLR류의 대배치 요구와 대비된다.

## 계보에서의 위치

[자기지도학습 세 갈래](/insight/self-supervised-learning/) 중 자기증류 계열의 대표작. [SimCLR](/papers/simclr/)의 negative 요구를 BYOL이 제거했고, DINO는 그 노선을 [ViT](/papers/vit/)와 결합해 "붕괴 방지 최소 레시피"(centering+sharpening)로 정리하면서, 방법론을 넘어 **창발 현상**(attention = 분할)을 발견해 판을 키웠다. [DeiT](/papers/deit/)의 증류가 convnet 교사의 지식을 옮기는 것이었다면 DINO의 증류는 교사조차 자기 자신이다 — "distillation with no labels"라는 이름이 정확하다. 이 표현의 실용성(frozen으로 바로 쓰는 k-NN/linear)이 DINOv2의 "범용 시각 foundation model" 노선으로 직행하고, attention 분할 창발은 무감독 분할 연구(LOST, TokenCut 등)의 출발점이 됐다.
