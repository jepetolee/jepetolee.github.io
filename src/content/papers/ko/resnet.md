---
title: "ResNet: 항등 지름길로 152층을 학습하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "CVPR", "ResNet", "Residual Connection", "CNN", "ImageNet", "Microsoft Research"]
paper: "Deep Residual Learning for Image Recognition"
paperUrl: "https://arxiv.org/abs/1512.03385"
authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun"
venue: "CVPR"
year: 2016
references: ["alexnet", "vgg"]
description: 깊은 plain 망이 얕은 망보다 학습 오류조차 높아지는 열화 문제를 지적하고, 층이 H(x) 대신 잔차 F(x) = H(x) - x를 배우게 하는 항등 지름길 연결로 이를 해결한다. 152층 ResNet으로 ILSVRC-2015 우승(top-5 3.57%), residual connection은 이후 모든 딥러닝 아키텍처의 기본 부품이 됐다.
---

## 한 줄 요약

VGG가 멈춘 지점(~19층)의 원인은 과적합도, 그래디언트 소멸도 아니었다 — 56층 plain 망은 20층보다 **학습 오류조차** 높다(열화 문제, degradation). ResNet의 처방은 층이 원하는 사상 $H(x)$를 통째로 배우는 대신 **잔차 $F(x) = H(x) - x$만 배우고 입력을 항등 지름길로 더해주는 것**: $y = F(x) + x$. 이 한 줄로 152층이 학습되고, ILSVRC-2015를 3.57%로 우승했으며, residual connection은 CNN을 넘어 Transformer까지 모든 현대 아키텍처의 기본 부품이 됐다.

## 핵심 기여

- **열화 문제의 정식화**: 깊은 망은 얕은 망 + 항등 층들로 구성 가능하므로 표현력상 얕은 망보다 나빠질 이유가 없다 — 그런데 나빠진다. BatchNorm으로 순전파/역전파 신호가 건강함을 확인한 조건에서도 그렇다. 즉 이것은 표현력이 아니라 **최적화의 문제**다: 비선형 층 스택으로 항등 사상을 근사하는 것 자체가 어렵다.

- **잔차 학습**: 최적 사상이 항등에 가깝다면, $F(x)$를 0 근처로 미는 것이 비선형 스택으로 항등을 새로 배우는 것보다 쉽다.

$$y = F(x, \{W_i\}) + x$$

  지름길은 파라미터도 계산량도 추가하지 않는다. 차원이 바뀔 때만 projection $W_s x$를 쓴다 — 옵션 비교(A: zero-padding / B: 차원 증가 시만 projection / C: 전부 projection)에서 차이가 미미해, **항등 지름길로 충분**함을 확인했다. 실제로 학습된 잔차 함수들의 응답 크기가 plain 망보다 작다는 분석(Fig. 7)이 "최적해가 항등 근처"라는 가설을 지지한다.

- **Bottleneck 블록**: 50층 이상에서는 3×3 두 개 대신 **1×1(축소) → 3×3 → 1×1(복원)** 구조로 비싼 3×3이 저차원에서 돌게 한다. 덕분에 ResNet-152(11.3 GFLOPs)가 VGG-19(19.6 GFLOPs)보다 깊이는 8배인데 계산은 더 싸다. 모든 conv 뒤에 BatchNorm, dropout은 없음.

- **아키텍처 패밀리**: ResNet-18/34(basic block), 50/101/152(bottleneck). VGG식 균일 설계(3×3, 해상도 절반이면 채널 2배)를 계승하고, FC 대신 global average pooling으로 마무리 — VGG의 비대한 FC 문제도 함께 청산했다.

## 주요 결과

- **논지의 직접 증명**: plain-18 27.94% < plain-34 28.54%(깊을수록 나빠짐) ↔ ResNet-18 27.88% > ResNet-34 25.03%(깊을수록 좋아짐). 같은 계산량, 지름길 유무만 다르다.
- ResNet-152 단일 top-1 21.43% / top-5 5.71%, 앙상블 top-5 **3.57%** — ILSVRC-2015 분류 우승.
- CIFAR-10: 110층 6.43%(1.7M 파라미터). **1202층도 학습은 된다**(학습 오류 <0.1%) — 다만 테스트 7.93%로 과적합. 최적화 장벽은 사라졌고 남은 것은 정규화 문제임을 보여주는 실험.
- 전이: Faster R-CNN의 backbone을 VGG-16에서 ResNet-101로 바꾸는 것만으로 COCO mAP@[.5,.95] +6.0%p(상대 28%). ILSVRC/COCO 2015의 검출·위치추정·분할 전 부문 1위.

## 계보에서의 위치

[VGG](/papers/vgg/)의 "깊이가 답"이라는 방향은 맞았지만 plain 스택으로는 19층이 한계였고, ResNet이 그 벽을 최적화 관점에서 부쉈다. 이 논문의 유산은 컴퓨터 비전을 넘는다: $y = F(x) + x$의 덧셈 경로는 [LSTM](/papers/lstm/)의 상수 오차 회전목마와 같은 원리(그래디언트가 스케일 없이 흐르는 통로)의 공간 버전이며, [Transformer](/papers/transformer/)의 모든 서브층($\text{LayerNorm}(x + \text{Sublayer}(x))$)에 그대로 들어가 있다 — 오늘날 "residual stream"이라는 말이 LLM 해석 연구의 기본 어휘가 된 것이 그 증거다. 비전 계보 안에서는 이후 등장하는 거의 모든 것(SENet, MobileNetV2, EfficientNet, ViT)이 ResNet을 딛고 서 있고, ImageNet backbone의 기본값 자리는 ViT 시대까지 ResNet-50이 지켰다.
