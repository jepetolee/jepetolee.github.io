---
title: "VGG: 3×3만으로 깊이를 증명하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "ICLR", "VGG", "CNN", "ImageNet"]
paper: "Very Deep Convolutional Networks for Large-Scale Image Recognition"
paperUrl: "https://arxiv.org/abs/1409.1556"
authors: "Karen Simonyan, Andrew Zisserman"
venue: "ICLR"
year: 2015
references: ["alexnet"]
description: 필터를 3×3 하나로 통일하고 깊이만 11층에서 19층까지 늘리는 통제 실험으로, 깊이가 CNN 성능의 핵심 변수임을 보였다. VGG16/19는 ILSVRC-2014 준우승과 함께 이후 수년간 전이학습의 표준 backbone이 됐다.
---

## 한 줄 요약

AlexNet 이후 "무엇을 바꿔야 더 좋아지는가"에 대한 답들이 난립하던 시기에, VGG는 다른 모든 변수를 고정하고 **깊이 하나만** 체계적으로 늘리는 통제 실험을 했다. 도구는 단 하나 — 모든 필터를 3×3으로 통일하는 것. 결론은 명확했다: 11층에서 19층까지, 깊을수록 좋다.

## 핵심 기여

- **3×3 스택의 산수**: 3×3 두 층은 5×5 하나와, 세 층은 7×7 하나와 같은 수용 영역을 갖는다. 그런데 채널 수 $C$ 기준 파라미터는 $3(3^2 C^2) = 27C^2$ vs $7^2 C^2 = 49C^2$ — **더 적은 파라미터로 같은 수용 영역에 비선형성은 3배**. "큰 필터는 작은 필터의 스택으로 분해하는 것이 항상 이득"이라는 이 산수가 이후 모든 CNN 설계의 기본 문법이 된다(2010년대 후반까지 7×7이 살아남은 곳은 stem 정도다).

- **구성 A~E**: conv는 전부 3×3(stride 1, same padding), 풀링은 2×2 max 5회, 채널은 풀링마다 64→128→256→512로 2배, 마지막은 AlexNet과 같은 FC 4096-4096-1000. 이 틀에서 층수만 11(A) → 13(B) → 16(C, 1×1 conv 포함) → 16(D) → 19(E)로 늘린다. C의 1×1 conv는 수용 영역을 건드리지 않고 비선형성만 추가하는 장치 — 같은 층수의 D(전부 3×3)가 C보다 나아서, 공간적 문맥을 보는 것도 여전히 중요함을 함께 보였다. AlexNet의 LRN은 **효과가 없고 메모리만 먹는다**고 보고하며 계보에서 퇴출시켰다.

- **깊은 망 학습의 요령**: 19층은 당시 기준 랜덤 초기화로 학습이 어려워, 얕은 A를 먼저 학습한 뒤 그 가중치로 깊은 망의 앞 4개 conv와 FC 3층을 초기화했다(사전학습에 의한 초기화 — residual 이전 시대의 고육지책). 학습은 배치 256, momentum 0.9, weight decay 5e-4, dropout 0.5, lr 1e-2에서 3회 감쇠, 74에폭.

- **멀티스케일 학습과 dense evaluation**: 학습 이미지의 짧은 변 $S$를 $[256, 512]$에서 무작위 샘플링하는 scale jittering이 상당한 이득. 테스트 시에는 FC층을 conv로 변환(첫 FC → 7×7 conv, 나머지 → 1×1 conv)해 **fully-convolutional로 임의 크기 이미지에 dense하게 적용**하고 score map을 공간 평균 — 크롭 없이 전체 이미지를 쓰는 이 기법은 이후 FCN(segmentation)의 직접적 전신이다.

## 주요 결과

- 깊이의 효과가 단조롭다: top-1 오류 A(11층) 29.6% → D(16층) 25.6% → E(19층) 25.5%. 16~19층에서 포화 조짐 — **plain 망의 한계 지점**이고, 이것이 ResNet의 출발 질문이 된다.
- 최종: 단일 모델 top-5 **7.0%**(E, multi-crop+dense), D+E 앙상블 **6.8%**. ILSVRC-2014 분류 준우승(대회 제출 7.3%) — 우승 GoogLeNet(6.7%)과 근소한 차이지만 구조는 훨씬 단순하다.
- **전이가 진짜 유산**: PASCAL VOC-2007/2012 mAP 89.7/89.3, Caltech-101 92.3 등 frozen feature만으로 당시 SOTA를 압도. 단순하고 균일한 구조 덕에 VGG16/19는 이후 수년간 검출(Faster R-CNN), 분할(FCN), 스타일 전이, perceptual loss의 기본 backbone이 됐다.

## 계보에서의 위치

[AlexNet](/papers/alexnet/)이 "CNN이 이긴다"를 증명했다면 VGG는 "**깊이가** 이긴다"를 통제 실험으로 증명했고, 그 도구인 3×3 통일은 설계 문법으로 남았다. 하지만 두 가지 유산이 엇갈린다: 138M 파라미터(대부분 FC층)의 비효율은 GAP와 경량화 계보(MobileNet)가 청산할 숙제가 됐고, "19층에서 왜 포화되는가"라는 질문은 곧바로 ResNet의 residual connection으로 이어진다. 균일한 블록 반복이라는 VGG의 설계 철학 자체는 ResNet, 그리고 Transformer 시대까지 살아남았다.
