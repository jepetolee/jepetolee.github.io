---
title: "DeiT: JFT 없이, 증류 토큰으로 ViT를 ImageNet에서 학습하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전 트랜스포머
tags: ["컴퓨터 비전", "ICML", "Meta AI", "DeiT", "지식 증류", "Transformer"]
paper: "Training data-efficient image transformers & distillation through attention"
paperUrl: "https://arxiv.org/abs/2012.12877"
authors: "Hugo Touvron, Matthieu Cord, Matthijs Douze, Francisco Massa, Alexandre Sablayrolles, Hervé Jégou"
venue: "ICML"
year: 2021
references: ["vit"]
description: 강한 증강·정규화 레시피와 convnet 교사의 hard label을 어텐션으로 받는 증류 토큰으로, JFT-300M 없이 ImageNet-1k만으로 ViT를 학습한다. DeiT-B 증류 모델은 8-GPU 3일 학습으로 top-1 85.2%(384px)에 도달해 JFT 사전학습 ViT-B를 넘어섰다.
---

## 한 줄 요약

ViT의 결론은 "JFT-300M(비공개 3억 장)이 있어야 한다"였다 — 그러면 Google 밖에서는 못 쓴다는 뜻이다. DeiT는 **학습 레시피(강한 증강 + 정규화)와 convnet 교사로부터의 증류**만으로 ImageNet-1k에서 ViT를 학습해냈다: 8 GPU 3일, 외부 데이터 0장으로 85.2%(384px) — JFT로 사전학습한 ViT-B(84.15%)보다 높다. ViT를 "누구나 쓸 수 있는 것"으로 만든 논문.

## 핵심 기여

- **레시피가 절반이다**: 같은 ViT-B 구조가 ImageNet-1k에서 77.9%(원논문 세팅) → **81.8%**(DeiT-B)로 뛴다. 재료는 RandAugment, Mixup(0.8), CutMix(1.0), random erasing, repeated augmentation(3×), stochastic depth(0.1), label smoothing(0.1), AdamW(wd 0.05, 배치 비례 lr), 300에폭 cosine. inductive bias가 없는 모델은 **증강과 정규화가 데이터를 대신해야** 학습된다는 것을 재료 단위 ablation으로 보였다(특히 repeated augmentation이 결정적, dropout은 오히려 해로움).

- **증류 토큰 — 어텐션을 통한 증류**: class 토큰 옆에 학습형 **distillation 토큰**을 하나 더 붙인다. 두 토큰은 self-attention으로 전체 패치와 상호작용하되, class 토큰은 정답 라벨을, distillation 토큰은 **교사의 hard 예측** $y_t = \arg\max Z_t$를 타깃으로 한다.

$$\mathcal{L} = \tfrac{1}{2}\mathcal{L}_{CE}(\psi(Z_s), y) + \tfrac{1}{2}\mathcal{L}_{CE}(\psi(Z_{s,\text{distill}}), y_t)$$

  soft KL 증류(81.8%)보다 hard 증류(83.0%)가 명확히 좋았다. 두 토큰의 코사인 유사도는 초기 0.06에서 최종 층 0.93으로 수렴하지만 끝내 같아지지는 않는다 — 서로 다른(라벨 vs 교사) 신호를 분업해서 나른다는 뜻.

- **왜 convnet 교사인가**: 교사로 Transformer보다 **RegNetY-16GF(convnet, 82.9%)**가 낫다. 해석은 inductive bias의 전이 — 학생 ViT가 국소성·등변성 같은 CNN의 가정을 데이터가 아니라 교사의 예측 분포에서 물려받는다. 실제로 distillation 토큰의 출력이 class 토큰보다 convnet 예측과 더 상관이 높다.

## 주요 결과

- DeiT-Ti 72.2% / DeiT-S 79.8% / DeiT-B 81.8% (224px). 증류 포함 DeiT-B⚗ **83.4%**, 384px 미세조정 시 **85.2%**.
- 처리량-정확도 트레이드오프에서 EfficientNet-B7과 대등 이상 — "convnet만이 효율적"이라는 통념을 Transformer가 처음 위협한 지점. 증류 모델은 교사 RegNet보다도 이 트레이드오프에서 낫다.
- 증류의 이득은 학습을 길게 끌수록 커진다(300에폭 이후에도 개선 지속).

## 계보에서의 위치

[ViT](/papers/vit/)의 "데이터가 bias를 이긴다"는 명제를 "**레시피와 증류가 데이터를 대신할 수 있다**"로 보완해, 비전 Transformer 연구를 소수 대기업의 전유물에서 커뮤니티 표준으로 바꾼 논문이다. DeiT의 학습 레시피는 이후 거의 모든 ViT 계열 논문의 기본 세팅이 되었고(Swin도 이 레시피 위에서 학습된다), 저자들의 후속작(CaiT, DeiT III)과 함께 "ViT는 데이터 굶주림 때문에 못 쓴다"는 반론을 소멸시켰다. 증류 토큰이라는 장치 자체는 이후 토큰 기반 아키텍처에서 "특수 목적 토큰을 추가해 별도 신호를 나른다"는 설계 패턴의 초기 사례로 남았다.
