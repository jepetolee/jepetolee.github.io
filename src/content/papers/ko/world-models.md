---
title: "World Models: 꿈 속에서 정책을 학습하다"
date: 2022-09-20
category: 강화학습
subcategory: World Models
tags: ["강화학습", "월드 모델", "인공신경망", "NeurIPS", "World Model", "VAE", "RNN"]
paper: "World Models"
paperUrl: "https://arxiv.org/abs/1803.10122"
authors: "David Ha, Jürgen Schmidhuber"
venue: "NeurIPS"
year: 2018
references: []
description: 에이전트가 환경의 압축된 내부 모델을 학습하고, 그 모델이 만든 가상 환경(꿈) 안에서 정책을 훈련한다는 월드 모델 계열의 출발점.
---

## 한 줄 요약

관측을 **VAE(V)** 로 압축하고, 시계열은 **MDN-RNN(M)** 으로 예측하며, 작은 **Controller(C)** 가 행동을 결정한다. 학습된 월드 모델이 만든 가상 롤아웃(꿈) 안에서 정책을 학습해도 실제 환경으로 전이된다.

## 핵심 기여

환경을 직접 다루는 대신, 에이전트가 **세계를 시뮬레이션하는 내부 모델**을 먼저 학습한다. 모델은 세 부분으로 나뉜다.

- **V (Vision)**: 고차원 관측 $o_t$ 를 저차원 잠재 벡터 $z_t$ 로 압축하는 VAE.
- **M (Memory)**: $p(z_{t+1} \mid z_t, a_t, h_t)$ 를 예측하는 MDN-RNN. 미래의 불확실성을 혼합 가우시안으로 표현한다.
- **C (Controller)**: $z_t$ 와 RNN 은닉 상태 $h_t$ 를 입력받아 행동을 내는 아주 작은 선형 정책.

## 인사이트

무거운 표현 학습(V, M)과 가벼운 정책 학습(C)을 분리한 점이 핵심이다. C가 매우 작기 때문에 진화 전략(CMA-ES) 같은 비미분 최적화로도 학습할 수 있다.

> "꿈 속에서 학습한 정책이 현실에서도 동작한다"는 관찰이 이후 모델 기반 RL의 표본 효율 논의를 본격화시켰다. 이 흐름은 PlaNet, Dreamer 계열로 이어진다.
