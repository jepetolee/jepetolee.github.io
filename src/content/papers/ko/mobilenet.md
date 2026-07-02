---
title: "MobileNet: depthwise separable로 30배 가벼운 CNN"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "Google Research", "MobileNet", "경량화", "CNN"]
paper: "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications"
paperUrl: "https://arxiv.org/abs/1704.04861"
authors: "Andrew G. Howard, Menglong Zhu, Bo Chen, Dmitry Kalenichenko, Weijun Wang, Tobias Weyand, Marco Andreetto, Hartwig Adam"
venue: "arXiv"
year: 2017
references: ["vgg"]
description: 표준 convolution을 depthwise(채널별 공간 필터)와 pointwise(1×1 채널 혼합)로 분해해 계산량을 8~9배 줄인 경량 아키텍처를 제안한다. 너비 배수 α와 해상도 배수 ρ로 지연시간-정확도 트레이드오프를 연속적으로 조절하며, VGG16의 1/30 계산량으로 거의 같은 ImageNet 정확도를 낸다.
---

## 한 줄 요약

서버에서 이기는 모델과 폰에서 도는 모델은 다른 문제다. MobileNet은 표준 conv를 **depthwise conv(공간 필터링) + 1×1 pointwise conv(채널 혼합)**로 분해해 계산량을 8~9배 줄이고, 너비 배수 $\alpha$와 해상도 배수 $\rho$라는 두 개의 손잡이로 "주어진 지연시간 예산에 맞는 모델"을 연속적으로 뽑아낼 수 있게 했다 — VGG16 대비 계산 1/30, 파라미터 1/33에 정확도는 -0.9%p.

## 핵심 기여

- **분해의 산수**: 입력 채널 $M$, 출력 채널 $N$, 커널 $D_K$, feature map $D_F$일 때

$$\underbrace{D_K^2 \cdot M \cdot D_F^2 + M \cdot N \cdot D_F^2}_{\text{depthwise + pointwise}} \quad \text{vs} \quad \underbrace{D_K^2 \cdot M \cdot N \cdot D_F^2}_{\text{표준 conv}}$$

  절감 비율은 $1/N + 1/D_K^2$ — $3\times 3$이면 **8~9배**. 표준 conv가 한 번에 하던 "공간 필터링 × 채널 결합"을 두 단계로 풀어도 정확도 손실은 1%p 수준임을 실증했다(full conv 71.7% vs separable 70.6%).

- **하드웨어를 아는 설계**: 28층 전체가 depthwise/pointwise의 반복(각각 BN+ReLU), 다운샘플링은 풀링 대신 stride-2 depthwise conv. 계산 시간의 **95%가 1×1 conv**에 몰리는데, 1×1은 im2col 재배열 없이 바로 고도로 최적화된 GEMM으로 돌릴 수 있다 — FLOPs 수치만이 아니라 실제 구현 효율까지 설계에 넣었다는 것이 이 논문의 실무적 미덕이다.

- **두 개의 스케일 손잡이**: 너비 배수 $\alpha \in \{1, 0.75, 0.5, 0.25\}$는 모든 층의 채널을 균일하게 줄이고(비용 $\propto \alpha^2$), 해상도 배수 $\rho$는 입력 해상도를 줄인다(비용 $\propto \rho^2$). 정확도-계산량 트레이드오프가 두 축 모두에서 매끄럽게 움직여, 배포 제약에 맞춰 모델을 "고르는" 게 가능해진다.

- **얇게 vs 얕게**: 같은 계산 예산에서 층을 빼는 것(shallow, 65.3%)보다 채널을 줄이는 것(0.75 width, 68.4%)이 명확히 좋다 — 깊이를 지키라는 설계 지침.

## 주요 결과

- ImageNet: MobileNet-224 top-1 **70.6%** / 569M mult-adds / 4.2M 파라미터. VGG16(71.5% / 15,300M / 138M) 대비 계산 1/27, GoogLeNet(69.8% / 1,550M)보다 정확하고 가볍다.
- 극단 축소도 유효: 0.5 MobileNet-160은 76M mult-adds로 60.2%.
- 전이: COCO 검출(SSD/Faster R-CNN 프레임에서 VGG급 mAP), Stanford Dogs 83.3%(Inception V3 84%에 근접), 얼굴 속성(FaceNet 증류) 등 — 경량 backbone이 분류 밖에서도 통함을 확인.

## 계보에서의 위치

[CNN 해부학](/insight/cnn-fundamentals/)에서 정리한 depthwise separable 분해를 아키텍처 전체의 원리로 승격시켜, **"정확도만이 아니라 지연시간이 1급 설계 목표"**라는 경량화 계보를 연 논문이다([VGG](/papers/vgg/)의 138M 파라미터가 정확히 그 반면교사다). 후속작들이 빠르게 이었다: MobileNetV2가 inverted residual + linear bottleneck을, V3가 NAS와 SE 블록을 더했고, 이 부품들은 EfficientNet의 MBConv로 흡수된다. "FLOPs ≠ 지연시간"이라는 교훈(depthwise는 메모리 바운드가 되기 쉽다)까지 포함해, 온디바이스 ML 시대의 출발점.
