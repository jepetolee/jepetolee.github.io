---
title: "EfficientNet: 깊이·너비·해상도를 하나의 계수로 함께 키우다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "ICML", "Google Research", "EfficientNet", "NAS", "CNN"]
paper: "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks"
paperUrl: "https://arxiv.org/abs/1905.11946"
authors: "Mingxing Tan, Quoc V. Le"
venue: "ICML"
year: 2019
references: ["resnet", "mobilenet", "senet"]
description: 깊이, 너비, 해상도 중 하나만 키우면 정확도가 조기 포화됨을 보이고, 세 축을 α^φ, β^φ, γ^φ로 함께 키우는 compound scaling을 제안한다. NAS로 찾은 MBConv+SE 기반 B0에 이를 적용한 B7이 8.4배 적은 파라미터로 ImageNet 84.3%를 달성했다.
---

## 한 줄 요약

CNN을 키우는 축은 셋이다 — 깊이(층수), 너비(채널), 해상도(입력 크기). 어느 하나만 키우면 정확도는 80% 근처에서 조기 포화된다. EfficientNet의 답은 **세 축을 고정된 비율로 동시에** 키우는 compound scaling: 좋은 베이스(NAS로 찾은 B0)에 계수 $\phi$ 하나만 돌리면 B1~B7 패밀리가 나오고, B7은 당시 SOTA(GPipe) 대비 **파라미터 8.4배 절감, 추론 6.1배 빠른** 84.3%를 찍었다.

## 핵심 기여

- **단일 축 스케일링의 포화**: 깊이만(수용 영역은 늘지만 최적화가 어려워짐), 너비만(고수준 특징 부족), 해상도만(세부는 늘지만 문맥 고정) 키우는 실험 모두에서 이득이 빠르게 감소함을 실증. 직관은 단순하다 — **해상도를 키우면 그것을 소화할 수용 영역(깊이)과 채널(너비)도 함께 필요하다.**

- **Compound scaling**: 계수 $\phi$ 하나로 세 축을 함께 확장한다.

$$d = \alpha^\phi, \quad w = \beta^\phi, \quad r = \gamma^\phi, \qquad \text{s.t.}\ \ \alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$$

  conv 비용이 $d \cdot w^2 \cdot r^2$에 비례하므로 제약식은 "총 FLOPs가 $2^\phi$배"를 보장한다. $\phi=1$(자원 2배)에서 소규모 그리드 서치로 $\alpha=1.2, \beta=1.1, \gamma=1.15$를 정하고, 이후로는 이 비율을 고정한 채 $\phi$만 키운다 — 큰 모델에서 축별 서치를 반복하는 비용을 제거한 것이 실용적 핵심.

- **EfficientNet-B0**: 스케일링의 출발점을 MnasNet식 다목적 NAS(목적함수 $\text{ACC} \times (\text{FLOPS}/T)^{-0.07}$)로 찾았다. 구성은 MobileNetV2의 **MBConv**(inverted bottleneck + depthwise) + **SE 블록**, ~400M FLOPs — 이전 계보의 부품들(depthwise separable, SE)이 그대로 흡수된 조립품이다.

- **범용성 검증**: compound scaling을 기존 망에 적용해도 통한다 — 같은 FLOPs에서 MobileNetV2 depth-only 76.8% vs compound **77.4%**, ResNet-50 78.1% vs **78.8%**. 단일 축 대비 최대 +2.5%p.

## 주요 결과

- 패밀리: B0 77.1%(5.3M/0.39B) → B4 82.9%(19M/4.2B) → **B7 84.3%(66M/37B)**. 동급 정확도의 기존 모델 대비 파라미터/FLOPs 1~16배 절감(예: B4는 SENet-154급 정확도를 1/10 파라미터로).
- B7은 GPipe(557M 파라미터, 84.3%)와 같은 정확도를 **8.4배 작게, CPU 추론 6.1배 빠르게**.
- 전이학습: CIFAR-100 91.7%, Flowers 98.8% 등 8개 데이터셋에서 평균 9.6배 적은 파라미터로 SOTA급.
- CAM 시각화: compound로 키운 모델이 단일 축 모델보다 물체 관련 영역에 더 정확히 집중 — 세 축의 균형이 표현 품질로 이어진다는 정성적 증거.

## 계보에서의 위치

[MobileNet](/papers/mobilenet/)의 depthwise separable, [SENet](/papers/senet/)의 채널 게이트, [ResNet](/papers/resnet/)의 residual — 부품 혁신이 끝난 시점에서 "**부품이 아니라 스케일링 규칙**이 남은 문제"임을 보인 논문이다. NLP 쪽 [Scaling Laws](/papers/scaling-laws/)가 손실을 연산량의 멱법칙으로 정리했다면, EfficientNet은 비전에서 "예산을 세 축에 어떻게 배분하는가"라는 같은 질문에 공학적으로 답했다. CNN 계보의 정점이자 마지막 세대 — 이듬해 ViT가 "conv 없이 스케일만으로"라는 다른 답을 들고 나오면서, 효율 경쟁의 무대는 EfficientNetV2와 ConvNeXt로, 그리고 Transformer 계열과의 혼전으로 넘어간다.
