---
title: "CAM: 분류기가 어디를 보고 판단했는지 지도화하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 모델 해석
tags: ["컴퓨터 비전", "CVPR", "CAM", "모델 해석", "약지도 학습", "CNN"]
paper: "Learning Deep Features for Discriminative Localization"
paperUrl: "https://arxiv.org/abs/1512.04150"
authors: "Bolei Zhou, Aditya Khosla, Agata Lapedriza, Aude Oliva, Antonio Torralba"
venue: "CVPR"
year: 2016
references: ["alexnet", "vgg"]
description: Global average pooling 뒤의 선형 분류 가중치를 conv feature map에 되돌려 곱하면, 클래스별로 판별에 기여한 영역의 지도(Class Activation Map)를 얻을 수 있음을 보인다. 위치 라벨 없이 학습한 분류기만으로 ILSVRC 약지도 위치추정 top-5 오류 37.1%를 달성했다.
---

## 한 줄 요약

이미지 수준 라벨로만 학습한 분류 CNN의 conv 유닛들은 이미 물체 검출기처럼 동작하고 있다 — 그 위치 정보를 부수는 것은 마지막 FC층이다. FC를 **global average pooling(GAP) + 선형층**으로 바꾸면, 분류 가중치를 feature map에 되돌려 곱하는 것만으로 "이 클래스라고 판단한 근거 영역"의 지도, **Class Activation Map**을 공짜로 얻는다. 해석 가능성과 약지도 위치추정을 한 번에 연 논문이다.

## 핵심 기여

- **CAM의 유도 — 산수 한 줄**: GAP 구조에서 클래스 $c$의 softmax 이전 점수는

$$S_c = \sum_k w_k^c \sum_{x,y} f_k(x, y) = \sum_{x,y} \underbrace{\sum_k w_k^c\, f_k(x, y)}_{M_c(x,y)}$$

  합의 순서만 바꾸면 클래스 점수가 공간 위치별 기여 $M_c(x, y)$의 합으로 분해된다. 이 $M_c$가 CAM이다 — 마지막 conv feature map $f_k$를 클래스별 분류 가중치 $w_k^c$로 가중합한 것. 입력 크기로 업샘플하면 히트맵이 되고, 최대값의 20% 이상 영역을 묶으면 bounding box가 나온다.

- **왜 GAP인가**: NIN에서 GAP는 과적합 방지용 구조적 정규화로 제안됐지만, 이 논문은 GAP의 진짜 가치가 **마지막 층까지 공간 정보를 보존하는 것**임을 보였다. GMP(최대 풀링)와의 비교가 논지를 선명하게 한다: 평균은 물체의 **전체 범위**를 활성화해야 손실이 줄지만, 최대는 가장 판별적인 한 점만 찾으면 된다 — 분류 성능은 비슷해도 위치추정은 GAP가 명확히 좋다.

- **구조 요구사항과 비용**: conv feature map → GAP → 선형 softmax 구조가 필요하므로, AlexNet/VGG/GoogLeNet의 FC층을 제거해 개조했다(최종 해상도 13×13/14×14). 분류 정확도는 1~2% 하락 — 해석 가능성의 대가치고는 싸다.

## 주요 결과

- **약지도 위치추정**: 위치 라벨을 전혀 안 쓰고 GoogLeNet-GAP로 ILSVRC top-5 위치추정 오류 **37.1%**(휴리스틱 박스 선택 포함) — 완전지도 AlexNet(34.2%)에 근접. 역전파 기반 saliency 베이스라인(46.4%)을 크게 앞선다.
- **범용 국소화 특징**: CAM으로 잘라낸 영역으로 CUB-200 조류 세분류 정확도 63.0→**67.8%**. SUN397 등 8개 데이터셋 전이에서도 경쟁력 유지. 텍스트 검출, VQA, 약라벨 이미지에서의 시각 패턴 발견 등 태스크 특화 학습 없이 응용이 이어진다.

## 계보에서의 위치

"CNN은 블랙박스"라는 통념에 대해 "분류 가중치 자체가 이미 위치 설명"임을 보인, CNN 해석 연구의 실질적 출발점이다. 약점도 구조에서 나온다: GAP+선형층이라는 **특정 구조를 요구**하고, 마지막 conv층에서만 지도를 뽑을 수 있으며, 기존 학습 모델에는 재학습 없이 적용할 수 없다. 이 제약을 "가중치 $w_k^c$ 대신 그래디언트로 중요도를 얻자"로 일반화해 임의 구조에 적용 가능하게 만든 것이 Grad-CAM이다. 한편 "판별 영역의 지도"라는 출력 형식은 약지도 분할(weakly-supervised segmentation) 분야 전체의 기본 재료가 됐다.
