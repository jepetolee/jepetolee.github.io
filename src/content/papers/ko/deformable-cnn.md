---
title: "Deformable CNN: 고정 격자를 버리고 샘플링 위치를 학습하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "ICCV", "Microsoft Research", "Deformable Convolution", "CNN", "객체 검출"]
paper: "Deformable Convolutional Networks"
paperUrl: "https://arxiv.org/abs/1703.06211"
authors: "Jifeng Dai, Haozhi Qi, Yuwen Xiong, Yi Li, Guodong Zhang, Han Hu, Yichen Wei"
venue: "ICCV"
year: 2017
references: ["resnet"]
description: convolution의 고정된 k×k 샘플링 격자에 학습된 2D offset을 더해, 필터가 물체의 크기와 형태를 따라 휘어지게 만드는 deformable convolution을 제안한다. 분수 offset은 bilinear 보간으로 처리하며, ResNet-101의 마지막 3개 conv층만 교체해도 COCO 검출과 semantic segmentation이 크게 개선된다.
---

## 한 줄 요약

CNN의 기하 구조는 전부 고정되어 있다 — conv는 고정 격자에서 샘플링하고, 풀링은 고정 비율로 줄이고, RoI 풀링은 고정 bin으로 나눈다. 물체의 스케일·자세·변형은 고정이 아닌데도. Deformable convolution은 $k \times k$ 격자의 각 샘플링 위치에 **입력에서 계산된 offset**을 더해 필터가 물체를 따라 휘게 만든다 — 기하적 변형에 대한 적응을 데이터 증강이나 수공 설계가 아니라 **학습**으로 얻는 첫 실용적 해법.

## 핵심 기여

- **Deformable convolution**: 표준 conv $y(p_0) = \sum_{p_n \in \mathcal{R}} w(p_n)\, x(p_0 + p_n)$의 격자 $\mathcal{R}$에 위치별 offset을 더한다.

$$y(p_0) = \sum_{p_n \in \mathcal{R}} w(p_n)\; x(p_0 + p_n + \Delta p_n)$$

  offset $\{\Delta p_n\}$은 같은 입력 feature map에 붙는 **병렬 conv층**이 출력한다(커널당 $2N$채널 — $N$개 위치의 x/y offset). offset이 분수값이므로 bilinear 보간 $x(p) = \sum_q G(q, p)\, x(q)$로 샘플링하고, 보간이 미분 가능하므로 offset까지 end-to-end로 역전파된다. offset conv는 0으로 초기화 — 학습 시작 시점엔 표준 conv와 동일하게 출발한다.

- **Deformable RoI pooling**: 같은 아이디어를 검출기의 RoI bin에 적용 — bin별 offset을 fc층이 예측하고 RoI 크기로 정규화($\gamma = 0.1$)해 적용한다. position-sensitive 변형(R-FCN용)도 함께 제시.

- **적용 방식의 미니멀리즘**: ResNet-101의 **마지막 3개 conv층(res5a/b/c)만** deformable로 교체한다. 파라미터 증가 ~0.1M, 실행시간 오버헤드 3~15% — 사실상 공짜 업그레이드.

- **STN과의 구분**: Spatial Transformer Networks는 전역 파라미터 변환(affine 등)으로 feature map 전체를 워핑하지만, deformable conv는 **국소적이고 dense한** 샘플링 조정이라 segmentation 같은 dense 예측에도 그대로 쓰인다.

## 주요 결과

- **변형이 실제로 학습된다는 증거**: 학습된 유효 dilation(인접 샘플링 위치 간 평균 거리)이 작은 물체에서 5.3, 큰 물체에서 8.4, 배경에서 6.2(res5c) — **수용 영역이 물체 크기에 맞춰 적응**한다. 고정 dilation(2/4/6/8)을 전부 시험한 atrous conv 최고치보다 좋다(VOC mIoU 75.3 vs 73.6): "최적 dilation을 위치별로 학습하는 셈"이라는 해석이 정확히 성립한다.
- Semantic segmentation: PASCAL VOC mIoU 69.7→**75.2**, CityScapes 70.4→**75.2**.
- COCO 검출: Faster R-CNN mAP@[.5:.95] 29.4→**33.1**, R-FCN 30.8→**34.5**(상대 +12%), 멀티스케일 + iterative bbox까지 37.5.

## 계보에서의 위치

이 블로그의 [CNN 해부학](/insight/cnn-fundamentals/)에서 정리했듯, conv 변형의 계보는 대부분 채널 축을 자르는 이야기였다(grouped/depthwise/pointwise). Deformable conv는 유일하게 **공간 축의 격자 자체**를 학습 대상으로 만든 갈래다 — dilation이 격자를 "고정된 비율로 벌린" 것이라면, 이것은 격자를 "내용에 따라 휘게" 한 것. [ResNet](/papers/resnet/) 백본 위의 검출·분할 시스템에서 표준 부품이 되었고(DCNv2가 modulation을 추가하며 개선), 흥미롭게도 "샘플링 위치를 입력에 따라 동적으로 정한다"는 발상은 self-attention의 동적 가중치와 정신을 공유한다 — 실제로 후속작 Deformable DETR이 이 연산을 어텐션으로 번역하면서 두 계보가 합류한다.
