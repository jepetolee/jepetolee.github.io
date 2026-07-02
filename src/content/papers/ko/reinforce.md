---
title: "REINFORCE: 정책 그래디언트의 원전 — 보상 × 로그확률의 기울기"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "머신 러닝", "REINFORCE", "Policy Gradient", "인공신경망"]
paper: "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning"
paperUrl: "https://doi.org/10.1007/BF00992696"
authors: "Ronald J. Williams"
venue: "Machine Learning"
year: 1992
references: ["backpropagation", "actor-critic"]
description: 확률적 유닛을 가진 신경망에서 Δw = α(r − b)·∂ln g/∂w 형태의 갱신이 기대 보상의 그래디언트를 편향 없이 따라감을 증명한다. baseline의 무편향성, 에피소드 확장, 가우시안 유닛(연속 행동)까지 — 정책 그래디언트와 그 분산 축소 장치들의 수학적 원전.
---

## 한 줄 요약

미분할 수 없어 보이는 것을 미분하는 논문이다 — 행동이 확률적으로 **샘플링**되는 망에서, 기대 보상 $E\{r|W\}$의 그래디언트를 어떻게 오르는가? Williams의 답: 각 가중치를 $\Delta w_{ij} = \alpha_{ij}(r - b_{ij})\, e_{ij}$, $e_{ij} = \partial \ln g_i / \partial w_{ij}$(출력 분포의 로그확률 기울기 — "characteristic eligibility")로 갱신하면, **평균 갱신 방향이 정확히 $\nabla_W E\{r|W\}$와 정렬된다**(Theorem 1). 그래디언트를 추정해 저장하는 과정조차 없이 — 그래서 "simple". 오늘날 policy gradient라 불리는 모든 것의 수학적 원전이다.

## 핵심 기여

- **REINFORCE의 정의와 정리**: 이름부터가 갱신식의 문법이다 — "**RE**ward **I**ncrement = **N**onnegative **F**actor × **O**ffset **R**einforcement × **C**haracteristic **E**ligibility". baseline $b_{ij}$가 행동 $y_i$와 조건부 독립이기만 하면, $(r - b)\,\partial \ln g / \partial w$는 $\partial E\{r|W\}/\partial w$의 **무편향 추정량**이다(Theorem 1). 현대 표기로 옮기면 정확히 $\nabla_\theta J = \mathbb{E}[(r - b)\, \nabla_\theta \log \pi_\theta(a|s)]$ — log-derivative trick(score function estimator)의 강화학습 형태다.

- **baseline — 분산은 줄이고 편향은 없다**: 상수든, 과거 보상의 지수평균 $\bar{r}(t) = \gamma r(t-1) + (1-\gamma)\bar{r}(t-1)$(Sutton의 reinforcement comparison)이든, 입력의 함수든 — 행동과 무관하기만 하면 그래디언트 방향은 불변이고 분산만 달라진다. **"무엇을 빼도 편향이 없다"는 이 자유가** 이후 분산 축소 연구(가치 baseline → advantage → GAE)의 법적 근거가 된다.

- **구체적 사례들**: Bernoulli-logistic 유닛에서는 $\Delta w_{ij} = \alpha r (y_i - p_i) x_j$로 떨어지고 — Barto 계열의 $A_{R-I}$ 학습 자동자가 REINFORCE의 특수 사례임이 판명된다(기존 휴리스틱들에 사후적으로 이론을 깔아준 것). **가우시안 유닛**에서는 평균의 eligibility가 $(y - \mu)/\sigma^2$ — **연속 행동 정책 그래디언트**의 원형이며, $\sigma$를 별도 파라미터로 두면 "탐험의 정도 자체를 학습"할 수 있다는 관찰까지 담겨 있다(SAC의 학습되는 탐험의 먼 조상).

- **에피소드 확장(Theorem 2)**: 보상이 에피소드 끝에 한 번만 오는 경우, 시간축으로 펼친 망([backpropagation](/papers/backpropagation/)의 unfolding 논법)에 같은 정리가 적용되어 $\Delta w_{ij} = \alpha(r - b) \sum_{t=1}^{k} e_{ij}(t)$ — 에피소드 내 eligibility의 합. 온라인 누산기 하나면 구현되는, 몬테카를로 정책 그래디언트의 완성형이다.

- **정직한 한계**: 저자 스스로 이것이 국소 최적으로의 수렴조차 일반적으로 보장 못 하는 "그래디언트를 따르는" 방법일 뿐이고, 분산이 크며, 표본 효율이 낮음을 논한다 — 이후 30년의 개선 방향을 논문이 미리 적어둔 셈이다.

## 계보에서의 위치

[Value/Policy 지도](/insight/rl-value-policy-map/)에서 정책 갈래의 시작점이다. [actor-critic](/papers/actor-critic/)(1983)이 공학적 직관으로 먼저 만든 구조에서 actor의 갱신이 **왜** 작동하는지를 이 논문이 증명했고, baseline 자리에 학습된 가치 함수를 넣으면(critic) 그 직관과 이 수학이 합쳐진다 — Sutton et al.의 정책 그래디언트 정리(2000)가 함수 근사까지 포함해 이를 완성한다. 실전 계보로는 REINFORCE → advantage 기반 [A3C](/papers/a3c/) → 신뢰 영역의 [PPO](/papers/ppo/)로 이어지고, PPO가 [InstructGPT](/papers/instructgpt/)의 RLHF에 쓰이면서 — LLM이 인간 선호로 정렬되는 그 갱신식의 심장에는 여전히 $(r - b)\nabla \log \pi$가 있다. 미분 불가능한 샘플링을 우회하는 score function estimator로서, 강화학습 밖(하드 어텐션, NAS, 이산 잠재변수)에서도 표준 도구다.
