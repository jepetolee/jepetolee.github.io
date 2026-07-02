---
title: "SENet: 채널에 어텐션을 달다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "CVPR", "SENet", "어텐션", "CNN", "ImageNet"]
paper: "Squeeze-and-Excitation Networks"
paperUrl: "https://arxiv.org/abs/1709.01507"
authors: "Jie Hu, Li Shen, Samuel Albanie, Gang Sun, Enhua Wu"
venue: "CVPR"
year: 2018
references: ["resnet"]
description: 전역 평균 풀링으로 채널별 통계를 짜내고(squeeze) 두 FC층의 게이트로 채널별 중요도를 계산해(excitation) feature map을 재보정하는 SE 블록을 제안한다. 계산량 0.26% 추가로 ImageNet 오류를 일관되게 낮추며 ILSVRC-2017에서 우승했다.
---

## 한 줄 요약

Convolution은 공간과 채널 정보를 한 번에 섞지만, 채널 간의 의존 관계는 암묵적으로만 다뤄진다. SENet은 **"지금 이 입력에서 어떤 채널이 중요한가"를 명시적으로 계산해 채널별로 feature를 다시 스케일하는** SE 블록을 제안한다 — 사실상 채널 축의 어텐션이고, 계산량 0.26% 추가로 어떤 기존 아키텍처에든 꽂을 수 있는 플러그인이다. ILSVRC-2017 우승(top-5 2.251%)으로 효과를 증명했다.

## 핵심 기여

- **Squeeze — 채널의 전역 통계**: 채널 $c$의 feature map $u_c$를 전역 평균 풀링으로 스칼라 하나로 압축한다.

$$z_c = \frac{1}{H \times W} \sum_{i=1}^{H} \sum_{j=1}^{W} u_c(i, j)$$

  국소 수용 영역만 보는 conv와 달리, 이 서술자는 전역 문맥을 담는다(max pooling보다 avg가 좋았다).

- **Excitation — 채널 게이트**: 압축된 $z \in \mathbb{R}^C$를 병목 구조의 두 FC층에 통과시켜 채널별 가중치를 만든다.

$$s = \sigma\!\left( W_2\, \delta(W_1 z) \right), \qquad W_1 \in \mathbb{R}^{C/r \times C},\ W_2 \in \mathbb{R}^{C \times C/r}$$

  $\delta$는 ReLU, $\sigma$는 시그모이드, 축소비 $r=16$이 기본. 시그모이드라서 softmax처럼 채널끼리 배타적으로 경쟁하지 않고 **여러 채널이 동시에 강조될 수 있다**(비상호배타적 게이팅). 최종적으로 $\tilde{x}_c = s_c \cdot u_c$로 재보정한다.

- **통합과 오버헤드**: residual 블록의 비선형성 뒤, skip 덧셈 **앞**에 삽입한다(덧셈 뒤에 넣으면 항등 경로를 훼손해 성능 하락 — ablation으로 확인). SE-ResNet-50 기준 GFLOPs +0.26%(3.86→3.87), 파라미터 +~2.5M(~10%) — 파라미터 증가의 대부분은 채널이 많은 마지막 stage에서 나오는데, 마지막 stage의 SE는 활성이 1 근처로 포화되어 제거해도 손실이 0.1% 미만이라는 분석까지 제공한다.

## 주요 결과

- ImageNet top-1 오류: SE-ResNet-50 **23.29%** vs ResNet-50 24.80% — 대략 한 단계 깊은 모델(ResNet-101, 23.17%)에 맞먹는 이득을 절반의 계산으로. SE-ResNet-101 22.38%, SENet-154(ResNeXt 변형 기반) top-1 18.68% / top-5 4.47%.
- ILSVRC-2017 분류 우승: 앙상블 top-5 **2.251%** — 2016년 우승 대비 상대 ~25% 개선.
- 범용성: Inception, ResNeXt, MobileNet, ShuffleNet에 꽂아도 일관된 개선, COCO 검출(38.0→40.4 AP), CIFAR에서도 유효.
- **excitation의 해석**: 얕은 층에서는 클래스와 무관한(범용 특징) 게이팅, 깊어질수록 클래스 특이적으로 변한다 — 채널 중요도가 추상화 수준에 따라 분업된다는 관찰.

## 계보에서의 위치

[ResNet](/papers/resnet/)이 "깊이"의 문제를 풀었다면, SENet은 남은 축인 **"채널 간 관계"를 동적 게이팅으로** 최적화한 첫 대표작이다. NLP 쪽에서 어텐션이 부상하던 시기에, 비전 쪽에서 "feature 재보정 = 가벼운 어텐션"이라는 문법을 정착시켰다. 이 문법은 곧바로 CBAM(채널 + 공간 어텐션)으로 확장되고, MobileNetV3·EfficientNet이 SE 블록을 기본 부품으로 채택하면서 경량 아키텍처의 표준이 된다. "전역 문맥을 요약해 국소 연산을 조건화한다"는 아이디어는 ViT의 self-attention이 등장하기 전, conv 프레임 안에서 어텐션의 효용을 보여준 가교였다.
