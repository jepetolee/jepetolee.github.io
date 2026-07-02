---
title: "Backpropagation: 오차를 거꾸로 흘려 표현을 배우다"
date: 2026-07-02
draft: false
category: 머신 러닝
subcategory: 학습 이론
tags: ["머신 러닝", "인공신경망", "역전파", "경사하강법"]
paper: "Learning representations by back-propagating errors"
paperUrl: "https://doi.org/10.1038/323533a0"
authors: "David E. Rumelhart, Geoffrey E. Hinton, Ronald J. Williams"
venue: "Nature"
year: 1986
references: []
description: 다층 신경망의 모든 가중치에 대한 오차의 편미분을 출력층에서 입력층으로 연쇄법칙을 따라 전파하며 계산하는 back-propagation을 제시한다. 은닉 유닛들이 태스크의 내부 표현을 스스로 구성함을 대칭 검출과 가계도 과제로 보였다 — 퍼셉트론의 한계를 넘어 표현 학습이라는 개념을 연 4페이지.
---

## 한 줄 요약

퍼셉트론의 한계는 학습이 아니라 **은닉 유닛의 부재**였고, 은닉 유닛의 문제는 "무엇을 표현해야 하는지 태스크가 알려주지 않는다"는 것이었다(credit assignment). 이 4페이지 Nature 레터의 답: 오차 $E$의 각 가중치에 대한 편미분을 **출력에서 입력 방향으로 연쇄법칙을 재귀 적용**해 한 번의 역방향 패스로 전부 계산하고, 경사를 따라 내려가라. 은닉 유닛들은 이 과정에서 태스크의 규칙성을 담는 **내부 표현을 스스로 만든다** — 논문 제목이 "backpropagation"이 아니라 "learning representations"인 이유이자, 이후 40년 딥러닝 전체가 이 위에 서게 되는 알고리즘이다.

## 핵심 기여

- **순방향**: 각 유닛은 아래층 출력의 선형 결합 $x_j = \sum_i y_i w_{ji}$을 시그모이드 $y_j = 1/(1 + e^{-x_j})$에 통과시킨다. 저자들은 함수 형태가 본질이 아님을 명시한다 — **미분 가능하기만 하면 된다**(선형 결합을 쓰는 것은 학습 절차를 단순하게 만들 뿐).

- **역방향 — 연쇄법칙의 재귀**: 오차 $E = \frac{1}{2}\sum_c \sum_j (y_{j,c} - d_{j,c})^2$에서 출발해, 출력층의 $\partial E/\partial y_j = y_j - d_j$로부터

$$\frac{\partial E}{\partial x_j} = \frac{\partial E}{\partial y_j}\, y_j(1 - y_j), \qquad \frac{\partial E}{\partial w_{ji}} = \frac{\partial E}{\partial x_j}\, y_i, \qquad \frac{\partial E}{\partial y_i} = \sum_j \frac{\partial E}{\partial x_j}\, w_{ji}$$

  마지막 식이 재귀의 고리다 — 위층의 $\partial E/\partial x$들을 가중합하면 아래층의 $\partial E/\partial y$가 되고, 이를 층층이 반복하면 **모든 가중치의 그래디언트가 순방향 한 번 + 역방향 한 번**으로 나온다. 오늘날의 자동 미분(reverse-mode AD)이 하는 일 그대로다.

- **경사하강과 momentum**: 가중치 갱신은 $\Delta w = -\varepsilon\, \partial E/\partial w$, 그리고 수렴 가속을 위한

$$\Delta w(t) = -\varepsilon\, \frac{\partial E}{\partial w}(t) + \alpha\, \Delta w(t-1)$$

  — **momentum**($\alpha = 0.9$)의 원전이 이 논문이다. 대칭 파괴를 위한 작은 무작위 초기화, 해석을 위해 매 갱신마다 가중치를 0.2%씩 깎는 **weight decay**까지, 현대 학습 루프의 기본 부품들이 이미 다 등장한다.

- **은닉 유닛이 배우는 것**: (1) **거울 대칭 검출** — 입력 벡터의 대칭 여부는 개별 입력만 봐서는 알 수 없어 은닉층이 필수인 과제인데, 학습된 두 은닉 유닛이 중심 대칭 위치의 가중치를 크기는 같고 부호는 반대로(비율 1:2:4) 조직하는 우아한 해를 "발명"했다. (2) **가계도 과제** — (사람1, 관계, 사람2) 삼중항을 학습시키자 은닉 유닛들이 국적·세대·가문 분파 같은 **분산 표현의 특징들**을 스스로 만들었고, 학습에서 뺀 4개 삼중항에 일반화했다 — 두 동형(isomorphic) 가계도의 구조를 공유 표현으로 잡아낸 것. 표현 학습이라는 개념의 첫 실증이다.

- **미리 놓인 포석들**: 순환망을 시간축으로 펼치면(가중치 공유 제약과 함께) 같은 절차가 적용된다는 관찰 — **BPTT의 원형** — 과, 국소 최솟값은 이론적 우려만큼 실제로 심각하지 않으며 연결을 **더 늘리면** 오히려 나쁜 극소점을 우회할 차원이 생긴다는 관찰(과잉매개화의 이점에 대한 최초의 직관)까지 4페이지 안에 들어 있다. "뇌의 학습 모델로는 그럴듯하지 않다"는 정직한 단서도.

## 계보에서의 위치

연쇄법칙 기반의 자동 미분과 그 신경망 적용은 선행자들이 있다(Linnainmaa 1970, Werbos 1974; 논문 자체가 Parker와 LeCun의 독립 발견을 언급한다). 이 논문의 역할은 발명의 우선권이 아니라 **설득**이다 — Minsky & Papert의 『Perceptrons』(1969) 이후 얼어붙었던 신경망 연구에, "다층 망은 학습 가능하고, 은닉층은 의미 있는 표현을 만든다"를 Nature 지면에서 실증해 판을 되살렸다. 이 블로그의 모든 리뷰가 사실상 이 알고리즘의 후속이다: [LSTM](/papers/lstm/)은 backprop의 오차 흐름 분석에서, [TDNN](/papers/tdnn/)과 [LeNet](/papers/lenet/)은 backprop + 가중치 공유에서, [ResNet](/papers/resnet/)의 residual은 backprop이 잘 흐르는 구조에서 나왔다. "미분 가능하게 설계하면 학습된다"는 이 논문의 문법이 곧 딥러닝이다.
