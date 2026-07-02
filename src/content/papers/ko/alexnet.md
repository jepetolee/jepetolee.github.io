---
title: "AlexNet: 딥러닝이 컴퓨터 비전을 접수한 날"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "NeurIPS", "AlexNet", "CNN", "ImageNet"]
paper: "ImageNet Classification with Deep Convolutional Neural Networks"
paperUrl: "https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf"
authors: "Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton"
venue: "NeurIPS"
year: 2012
references: ["lenet"]
description: 5개 conv + 3개 FC, 60M 파라미터의 대형 CNN을 ReLU, dropout, 데이터 증강, 2-GPU 분산으로 ImageNet에서 학습해 ILSVRC-2012 top-5 오류 15.3%로 2위(26.2%)를 압도했다. 딥러닝 기반 컴퓨터 비전 시대를 연 논문.
---

## 한 줄 요약

"충분히 큰 CNN + 충분히 큰 데이터(ImageNet) + GPU"의 조합이 수작업 특징(SIFT 등) 기반 파이프라인을 한 번에 쓸어버릴 수 있음을 보인 논문. ILSVRC-2012에서 top-5 오류 **15.3% vs 2위 26.2%** — 10%p가 넘는 격차는 방법론의 개선이 아니라 패러다임의 교체였고, 이후 컴퓨터 비전의 모든 것이 이 결과에서 다시 시작된다.

## 핵심 기여

- **아키텍처**: 224×224×3 입력 → conv 5층(96@11×11 stride 4 → 256@5×5 → 384@3×3 → 384@3×3 → 256@3×3) → FC 4096 → FC 4096 → 1000-way softmax. 총 60M 파라미터, 65만 뉴런. 파라미터의 대부분은 FC층에 몰려 있다 — 이 비대한 FC를 없애는 것이 이후 계보(GAP, NIN)의 숙제가 된다.

- **ReLU**: 포화 비선형성(tanh, sigmoid) 대신 $f(x) = \max(0, x)$. CIFAR-10 실험에서 tanh 대비 **약 6배 빠른 수렴** — "이만한 크기의 망을 이만한 데이터로 돌리는 것" 자체를 가능하게 만든 결정이었다. 그래디언트가 포화 없이 흐른다는 점에서, 이후 residual connection과 함께 깊은 망 학습의 두 기둥이 된다.

- **2-GPU 분산과 grouped convolution의 기원**: GTX 580 3GB 한 장에 모델이 안 들어가서 필터를 두 GPU에 절반씩 나누고, 특정 층에서만 GPU 간 통신을 허용했다. 이론이 아니라 메모리 제약에서 나온 이 설계가 오늘날 grouped/depthwise convolution의 원형이다.

- **Local Response Normalization**: 인접 채널 간 활성을 경쟁시키는 정규화

$$b_{x,y}^i = a_{x,y}^i \Big/ \left( k + \alpha \sum_{j=\max(0, i-n/2)}^{\min(N-1, i+n/2)} (a_{x,y}^j)^2 \right)^\beta, \quad k=2,\ n=5,\ \alpha=10^{-4},\ \beta=0.75$$

  top-1 오류를 1.4% 줄였다 — 다만 이후 VGG가 효과 없음을 보고하고 BatchNorm이 등장하면서 계보에서 사라진 부품이다.

- **Overlapping pooling**: stride(2)보다 큰 창(3×3)의 풀링. top-5 오류 0.3% 개선과 과적합 완화.

- **과적합과의 전쟁**: (1) 데이터 증강 — 256×256에서 224×224 무작위 크롭 + 좌우 반전으로 데이터를 2048배 뻥튀기, RGB 채널의 PCA 주성분 방향으로 색상 섭동(조명 불변성). (2) **Dropout 0.5**를 FC 두 층에 적용 — 뉴런 간 co-adaptation을 깨는 앙상블 근사로 설명하며, 이것 없이는 심각하게 과적합했다고 보고한다.

- **학습**: SGD, 배치 128, momentum 0.9, weight decay 0.0005(단순 정규화가 아니라 학습 오류 자체를 줄였다고 언급), lr 0.01에서 검증 성능 정체 시 1/10. GTX 580 2장으로 5~6일.

## 주요 결과

- ILSVRC-2010: top-1 37.5% / top-5 17.0% — 종전 최고(top-5 25.7%) 대폭 경신.
- ILSVRC-2012: 단일 모델 top-5 18.2%, 앙상블+사전학습 조합 **15.3%** vs 2위 26.2%.
- 깊이가 중요하다는 직접 증거: conv 층 하나만 제거해도 top-1이 ~2% 나빠진다.
- 정성 분석: 첫 층 필터가 방향성 에지/색 blob으로 수렴하고(두 GPU가 색맹/색민감 필터로 자연 분업), 마지막 은닉층의 유클리드 거리가 의미적 유사성을 반영한다 — 학습된 특징이 표현으로서 유효하다는, 이후 전이학습 시대를 예고하는 관찰.

## 계보에서의 위치

CNN 자체는 LeNet(1998)부터 있었다. AlexNet의 기여는 발명이 아니라 **스케일에서의 실증**이다 — 데이터(ImageNet), 연산(GPU), 정규화(dropout, 증강), 비선형성(ReLU)이 갖춰지면 깊은 CNN이 수작업 특징을 압도한다는 것. 이 증명 이후 비전 커뮤니티 전체가 CNN으로 이동했고, 질문은 "CNN이냐 아니냐"에서 "어떻게 더 깊게 쌓느냐"로 바뀐다 — 그 질문에 대한 답이 VGG(작은 필터로 깊게)와 ResNet(residual로 아주 깊게)이다. 저자 중 Ilya Sutskever가 이후 Seq2Seq와 GPT 계보의 중심이 된다는 점에서, 이 논문은 NLP 시리즈와 비전 시리즈가 공유하는 뿌리이기도 하다.
