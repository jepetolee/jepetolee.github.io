---
title: "PlaNet: 잠재 공간에서 계획하기"
date: 2022-09-27
category: 강화학습
subcategory: World Models
tags: ["강화학습", "World Model", "RSSM", "Planning"]
paper: "Learning Latent Dynamics for Planning from Pixels (PlaNet)"
paperUrl: "https://arxiv.org/abs/1811.04551"
authors: "Danijar Hafner et al."
venue: "ICML"
year: 2019
references: ["world-models"]
description: 픽셀로부터 잠재 동역학을 학습하고, 그 잠재 공간 위에서 모델 예측 제어(MPC)로 직접 계획을 세우는 RSSM 기반 모델.
---

## 한 줄 요약

World Models가 잠재 공간에서 *정책*을 학습했다면, PlaNet은 잠재 공간에서 **직접 계획(planning)** 한다. 정책망 없이 학습된 동역학 모델과 CEM 기반 MPC만으로 제어한다.

## RSSM (Recurrent State Space Model)

이후 Dreamer 계열의 토대가 되는 구조가 여기서 정립된다. 잠재 상태를 두 갈래로 분리한다.

- 결정적 경로: $h_t = f(h_{t-1}, s_{t-1}, a_{t-1})$
- 확률적 경로: $s_t \sim p(s_t \mid h_t)$

결정적/확률적 경로를 함께 두어 장기 의존성과 불확실성을 동시에 다룬다.

## World Models와의 연결

- 잠재 공간 압축이라는 아이디어는 [World Models](/papers/world-models/)에서 그대로 계승한다.
- 차이는 **순수 모델 기반 계획**으로 옮겨가, 정책 파라미터 없이 행동을 탐색한다는 점이다.

## 한계

계획 단계의 탐색 비용이 크고, 매 스텝 CEM 최적화가 필요하다. 이 비용 문제를 정책망으로 푸는 것이 다음 단계인 Dreamer다.
