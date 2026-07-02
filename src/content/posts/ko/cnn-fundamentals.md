---
title: "CNN 해부학: convolution 연산의 수학과 변형들의 분류"
date: 2026-07-02
draft: false
category: 개념 정리
tags: ["컴퓨터 비전", "인공신경망", "CNN", "합성곱"]
description: convolution이 왜 이미지에 맞는 연산인지(국소성, 가중치 공유, 평행이동 등변성)부터 stride/padding/dilation이 출력 크기와 수용 영역을 결정하는 수식, 그리고 grouped/depthwise/pointwise/separable/deformable로 이어지는 변형 연산들의 계보까지 한 번에 정리한다.
tldr:
  - convolution은 국소성과 가중치 공유라는 두 개의 inductive bias를 FC 층에 부과한 연산이고, 그 대가로 평행이동 등변성을 얻는다.
  - 출력 크기는 (n + 2p - d(k-1) - 1)/s + 1 하나로 정리된다 — stride는 해상도를, padding은 경계를, dilation은 수용 영역을 통제한다.
  - depthwise(채널별 공간 필터)와 pointwise(1×1 채널 혼합)로 표준 conv를 분해하면 계산량이 대략 1/8~1/9로 줄어든다 — MobileNet 계열의 출발점.
prerequisites:
  - 행렬 곱과 신경망 순전파에 대한 기본 이해
---

## 왜 convolution인가

224×224×3 이미지를 fully-connected 층으로 처리하면 뉴런 하나가 150,528개의 가중치를 갖는다. 은닉 뉴런 1000개면 1.5억 파라미터 — 층 하나에서다. CNN은 이 낭비를 두 개의 가정(inductive bias)으로 잘라낸다.

1. **국소성(locality)**: 픽셀의 의미는 주변 픽셀과의 관계에서 나온다. 뉴런 하나가 $k \times k$ 국소 창만 보게 한다.
2. **가중치 공유(weight sharing)**: 왼쪽 위에서 에지를 찾는 필터는 오른쪽 아래에서도 유효하다. 같은 필터를 모든 위치에 재사용한다.

이 둘의 결과가 **평행이동 등변성(translation equivariance)**이다: 입력을 밀면 출력 feature map도 그만큼 밀린다 — $f(T(x)) = T(f(x))$. 분류에 필요한 평행이동 **불변성**(invariance)은 등변성 위에 풀링/GAP를 얹어 만든다. 이 구분을 흐리게 쓰는 글이 많은데, conv 자체는 불변이 아니라 등변이다.

수식으로는, 입력 $X \in \mathbb{R}^{H \times W \times C_{in}}$과 커널 $W \in \mathbb{R}^{k \times k \times C_{in} \times C_{out}}$에 대해 출력 채널 $o$의 위치 $(i, j)$는

$$Y_{i,j,o} = \sum_{c=1}^{C_{in}} \sum_{u=1}^{k} \sum_{v=1}^{k} W_{u,v,c,o} \cdot X_{i+u,\, j+v,\, c} + b_o$$

엄밀히는 커널을 뒤집지 않으므로 신호처리의 convolution이 아니라 **cross-correlation**이지만, 커널이 학습되는 이상 뒤집힘은 무의미해서 딥러닝에서는 그냥 convolution이라 부른다. 표준 conv의 핵심 성질 하나를 기억해두자: **모든 출력 채널이 모든 입력 채널을 본다** — 공간 방향으로는 희소하지만 채널 방향으로는 dense한 연산이다. 파라미터는 $k^2 C_{in} C_{out}$, 계산량(MACs)은 $k^2 C_{in} C_{out} H' W'$.

## 출력 크기를 결정하는 세 개의 손잡이

입력 한 변이 $n$, 커널 $k$, padding $p$, stride $s$, dilation $d$일 때 출력 한 변은 공식 하나로 정리된다:

$$o = \left\lfloor \frac{n + 2p - d(k-1) - 1}{s} \right\rfloor + 1$$

- **Padding** — 경계 처리이자 해상도 유지 장치. $p=0$(valid)이면 층마다 $k-1$씩 줄어들고, $p = (k-1)/2$(same, $s=1$ 기준)이면 해상도가 유지된다. padding이 없으면 깊은 망을 쌓을수록 경계 정보가 빠르게 소실된다. 부수 효과도 있다: zero padding은 절대 위치의 단서를 흘려서, CNN이 위치 정보를 생각보다 잘 아는 이유 중 하나다.

- **Stride** — 다운샘플링을 conv 안에 내장한 것. $s=2$ conv는 "conv 후 2배 풀링"의 학습 가능한 대체물이고, 계산량을 $1/s^2$로 줄인다. 현대 아키텍처는 풀링 대신 strided conv로 해상도를 줄이는 경우가 많다.

- **Dilation (atrous)** — 커널 원소 사이를 $d-1$칸씩 벌린다. 유효 커널 크기가 $k' = k + (k-1)(d-1)$이 되어, **파라미터와 계산량 추가 없이** 수용 영역만 넓힌다. 해상도를 줄이지 않고 넓은 문맥이 필요한 semantic segmentation(DeepLab)과 오디오(WaveNet의 지수적 dilation 스택)에서 표준이 됐다. 단점은 격자 무늬 아티팩트(gridding): $d$를 지수적으로만 쌓으면 인접 픽셀을 한 번도 안 보는 구멍이 생긴다.

이 손잡이들이 결정하는 최종량이 **수용 영역(receptive field)**이다. 층 $l$의 수용 영역은 재귀식

$$r_l = r_{l-1} + (k_l - 1) \cdot d_l \prod_{i=1}^{l-1} s_i$$

로 자란다 — stride가 클수록 뒤 층의 커널 한 칸이 입력에서 더 넓은 영역을 대변한다. 3×3을 두 번 쌓으면 5×5 하나와 같은 수용 영역을 더 적은 파라미터($2 \cdot 9 < 25$)와 더 많은 비선형성으로 얻는다는 관찰이 VGG의 출발점이고, "깊이 = 수용 영역의 성장"이라는 이 등식이 CNN 설계의 기본 문법이다.

## 변형 연산의 분류 — 채널 축을 어떻게 자르는가

표준 conv의 비용 $k^2 C_{in} C_{out}$에서 무엇을 아낄지에 따라 변형들이 갈린다. 핵심은 **공간 축($k^2$)과 채널 축($C_{in} C_{out}$)의 결합을 어디까지 끊느냐**다.

- **Grouped convolution**: 채널을 $g$개 그룹으로 나눠 그룹 안에서만 conv한다. 비용이 $1/g$. 기원은 이론이 아니라 공학 — AlexNet이 GPU 한 장에 모델이 안 들어가서 두 그룹으로 쪼갠 것이 시작이다. 이후 ResNeXt가 "cardinality"라는 이름으로 설계 원리로 승격시켰다.

- **Depthwise convolution**: grouped의 극한, $g = C_{in}$. 채널마다 자기만의 $k \times k$ 공간 필터 하나를 갖는다. 비용 $k^2 C_{in}$ — 채널 간 정보 교환이 전혀 없다는 것이 특징이자 한계.

- **Pointwise convolution (1×1)**: 공간을 전혀 안 보고($k=1$) 채널만 섞는다. 비용 $C_{in} C_{out}$. 위치별로 채널 벡터에 같은 FC를 적용하는 것과 동일하다. Network-in-Network에서 나와 (1) 채널 수 조절(bottleneck), (2) 채널 혼합, (3) 저렴한 비선형성 추가의 세 역할로 어디에나 쓰인다.

- **Depthwise separable convolution** = depthwise(공간) + pointwise(채널). 표준 conv가 한 번에 하던 "공간 필터링 × 채널 혼합"을 두 단계로 분해한다. 비용 비율은

$$\frac{k^2 C_{in} + C_{in} C_{out}}{k^2 C_{in} C_{out}} = \frac{1}{C_{out}} + \frac{1}{k^2}$$

  $k=3$이면 대략 **8~9배 절감**. "공간과 채널의 상관을 완전히 분리해도 표현력 손실이 크지 않다"는 가설(Xception)이 실증되면서 MobileNet 이후 모든 경량 아키텍처의 기본 부품이 됐다. EfficientNet의 MBConv도 이 분해에 expansion과 SE를 얹은 것이다.

- **Deformable convolution**: 여기까지의 변형이 전부 "채널 축을 자르는" 이야기였다면, deformable은 **공간 축의 고정 격자 자체를 학습**한다 — 샘플링 위치에 학습된 offset $\Delta p$를 더해 $k \times k$ 격자를 물체의 형태에 맞게 휘게 만든다. 자세한 것은 별도 리뷰([Deformable CNN](/papers/deformable-cnn/))로 다룬다.

정리하면 이렇게 읽으면 된다: **표준 conv는 공간-희소/채널-dense, depthwise는 공간만, pointwise는 채널만, separable은 그 둘의 직렬 조합, grouped는 중간 지점, dilated는 공간 격자를 벌린 것, deformable은 공간 격자를 학습하는 것.**

## 관전 포인트

FLOPs 절감이 곧 속도가 아니라는 점은 강조해둘 만하다. depthwise conv는 연산 강도(arithmetic intensity)가 낮아 GPU에서 메모리 바운드가 되기 쉽고, 그래서 MobileNet 계열이 서버 GPU보다 모바일 CPU/NPU에서 빛난다. "파라미터 수 ≠ FLOPs ≠ 지연시간"의 3중 구분은 경량화 논문을 읽을 때 항상 확인해야 하는 부분이다.

또 하나 — 이 글에서 정리한 inductive bias(국소성, 등변성, 계층적 수용 영역)는 이후 ViT가 등장하면서 정확히 반대 방향의 질문을 받게 된다: "그 bias들, 데이터가 충분하면 굳이 하드코딩할 필요가 있나?" CNN의 계보와 ViT 이후의 계보를 나란히 읽는 재미가 여기에 있다. 이 블로그의 비전 모델 리뷰 시리즈([AlexNet](/papers/alexnet/)부터)가 그 순서를 따라간다.
