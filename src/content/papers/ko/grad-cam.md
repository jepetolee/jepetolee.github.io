---
title: "Grad-CAM: 그래디언트로 CAM을 모든 구조로 일반화하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 모델 해석
tags: ["컴퓨터 비전", "ICCV", "Grad-CAM", "모델 해석", "CNN"]
paper: "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization"
paperUrl: "https://arxiv.org/abs/1610.02391"
authors: "Ramprasaath R. Selvaraju, Michael Cogswell, Abhishek Das, Ramakrishna Vedantam, Devi Parikh, Dhruv Batra"
venue: "ICCV"
year: 2017
references: ["cam"]
description: 클래스 점수의 그래디언트를 feature map에 대해 전역 평균한 값을 채널 중요도로 삼아, GAP 구조 요구와 재학습 없이 임의의 CNN에서 클래스 판별적 히트맵을 뽑는 Grad-CAM을 제안한다. GAP-선형 구조에서 CAM과 수학적으로 일치함을 증명해 엄밀한 일반화임을 보였다.
---

## 한 줄 요약

CAM은 강력하지만 "GAP + 선형층" 구조를 요구해서, FC층이 있는 모델이나 캡셔닝·VQA 같은 구조화된 출력 모델에는 재학습 없이 쓸 수 없다. Grad-CAM은 분류 가중치 대신 **클래스 점수의 그래디언트**로 채널 중요도를 얻는다 — 어떤 미분 가능한 CNN에든, 아키텍처 수정도 재학습도 없이 적용되며, GAP 구조에서는 CAM과 수학적으로 일치함을 증명해 "엄밀한 일반화"임을 보였다.

## 핵심 기여

- **방법**: 관심 클래스 점수 $y^c$의, 마지막 conv층 feature map $A^k$에 대한 그래디언트를 공간 전역 평균해 채널 중요도를 얻고,

$$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{ij}^k}$$

  feature map을 이 가중치로 합산한 뒤 ReLU를 취한다.

$$L^c_{\text{Grad-CAM}} = \text{ReLU}\!\left( \sum_k \alpha_k^c A^k \right)$$

  ReLU는 "해당 클래스를 **높이는** 방향의 영향만" 남기는 장치다 — 음의 기여는 다른 클래스에 속할 가능성이 높고, 실제로 ReLU를 빼면 위치추정 오류가 15.3% 나빠진다. 층은 마지막 conv층이 의미(고수준)와 공간(해상도)의 최적 절충점.

- **CAM의 엄밀한 일반화 (증명)**: GAP → 선형층 구조에서 $Y^c = \sum_k w_k^c F^k$의 그래디언트를 전개하면 $w_k^c = Z \cdot \partial Y^c / \partial A_{ij}^k$, 공간 합을 취하면 Grad-CAM의 $\alpha_k^c$가 정규화 상수 차이만 빼고 CAM의 $w_k^c$와 동일하다. 즉 CAM은 Grad-CAM의 특수 사례다.

- **Guided Grad-CAM**: Grad-CAM은 클래스 판별적이지만 저해상도(14×14)이고, guided backpropagation은 고해상도지만 클래스 구분이 없다. 둘을 원소곱으로 결합해 **고해상도이면서 클래스 판별적인** 시각화를 만든다.

- **반사실적 설명**: 그래디언트 부호를 뒤집으면($-\partial y^c$) "이걸 지우면 확신이 올라갈 영역" — 예측을 방해하는 영역의 지도를 얻는다.

## 주요 결과

- **약지도 위치추정(ILSVRC-15, VGG-16)**: top-1 오류 56.51% — CAM(57.20%)보다 좋으면서 **분류 성능 희생이 0**(CAM은 구조 개조로 분류가 나빠진다). Pointing Game 70.58% vs c-MWP 60.30%.
- **인간 평가**: 시각화만 보고 어느 클래스에 대한 설명인지 맞히는 실험에서 Guided Grad-CAM 61.23% vs Guided Backprop 44.44%. 두 모델의 예측이 같을 때도 사람들은 Guided Grad-CAM 시각화를 근거로 더 정확한 모델(VGG > AlexNet)을 신뢰 — **설명이 모델 품질 판별에 쓰일 수 있다**는 증거.
- **충실성(faithfulness)**: 패치 가림(occlusion)로 측정한 실제 중요도와의 순위 상관 0.254로 CAM(0.208), Guided Backprop(0.168)보다 높다.
- **편향 탐지 사례**: 의사/간호사 분류기가 얼굴·머리 모양을 보고 판단하고 있음을 Grad-CAM이 드러냈고(학습 데이터의 성비 편향), 데이터 재균형 후 주목 부위가 청진기·복장으로 이동하며 정확도 82→90%. 해석 도구가 실무에서 무엇을 위한 것인지 보여주는 대표 사례다.

## 계보에서의 위치

[CAM](/papers/cam/)의 "분류 근거의 공간 지도"를 그래디언트 기반으로 다시 쓰면서 구조 제약을 제거해, CNN 해석의 **사실상 표준 도구**가 된 논문이다(CBAM 같은 아키텍처 논문들이 자기 검증에 Grad-CAM을 쓰는 것이 그 증거). 이후 Grad-CAM++, Score-CAM, 그리고 그래디언트 기반 saliency의 신뢰성을 검증하는 sanity check 연구들로 이어지며 XAI 분야의 기준점 역할을 했다. ViT 시대에는 attention rollout 등이 그 자리를 이었지만, "마지막 표현층의 활성 × 클래스 방향 중요도"라는 Grad-CAM의 공식은 여전히 해석 도구 설계의 기본형이다.
