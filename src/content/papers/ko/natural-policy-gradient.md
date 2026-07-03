---
title: "Natural Policy Gradient: 파라미터의 거리가 아니라 분포의 거리로"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "NeurIPS", "Policy Gradient", "Fisher Information", "Natural Gradient"]
paper: "A Natural Policy Gradient"
paperUrl: "https://proceedings.neurips.cc/paper/2001/hash/4b86abe48d358ecf194c56c69108433e-Abstract.html"
authors: "Sham Kakade"
venue: "NeurIPS"
year: 2001
references: ["reinforce", "actor-critic"]
description: 정책 그래디언트의 최급상승 방향을 유클리드 계량이 아니라 Fisher 정보 행렬이 정의하는 분포 공간의 계량으로 다시 정의한다. 자연 그래디언트가 compatible function approximation의 가중치와 정확히 일치한다는 정리, 그리고 그 방향이 "조금 나은 행동"이 아니라 "greedy 최적 행동" 쪽을 가리킨다는 분석으로, 이후 TRPO·PPO로 이어지는 신뢰 영역 계보의 이론적 출발점이 된 논문.
---

## 한 줄 요약

경사 상승 $\theta \leftarrow \theta + \alpha \nabla J$는 "$\lVert \Delta\theta \rVert$가 작으면 정책 변화도 작다"는 유클리드 가정 위에 서 있는데, 정책은 확률 분포이므로 이 가정은 좌표(파라미터화)에 따라 멋대로 휜다. Amari의 자연 그래디언트를 강화학습에 이식한 이 논문의 답: **분포 공간의 계량(Fisher 정보 행렬)으로 잰 최급상승 방향 $F^{-1}\nabla J$를 따라가라.** 여기에 강화학습 고유의 보너스 정리가 붙는다 — 자연 그래디언트는 compatible 가치 근사의 가중치와 정확히 일치하고, 그 방향은 단지 나은 행동이 아니라 **greedy 최적 행동을 향한다**.

## 핵심 기여

- **계량의 교체**: 정책 $\pi_\theta(a \mid s)$의 국소 변화량을 KL 발산으로 재면, 2차 근사가 상태별 Fisher 행렬 $F_s(\theta) = \mathbb{E}_{\pi_\theta(\cdot \mid s)}[\nabla \log \pi_\theta(a \mid s) \nabla \log \pi_\theta(a \mid s)^\top]$로 주어진다. 논문은 이를 상태 방문 분포 $\rho^\pi$로 평균한 $F(\theta) = \mathbb{E}_{s \sim \rho^\pi}[F_s(\theta)]$를 계량으로 제안하고, 최급상승 방향

$$\widetilde{\nabla} J(\theta) = F(\theta)^{-1} \nabla J(\theta)$$

  을 **natural policy gradient**로 정의한다. 좌표를 바꿔도(같은 정책의 다른 파라미터화) 가리키는 분포 공간의 방향이 유지된다 — 일반 그래디언트에는 없는 성질이다. (저자 스스로 지적하는 단서: $\rho^\pi$ 가중 평균이라는 선택 때문에 완전한 리만 계량의 유일성 논증까지는 가지 않는다.)

- **Compatible function approximation과의 일치 정리**: 정책 그래디언트 정리(Sutton et al. 1999)의 compatible 근사 — $f_w(s, a) = w^\top \nabla \log \pi_\theta(a \mid s)$로 $Q^\pi$를 최소제곱 근사 — 를 가져오면, 그 최적 가중치 $w$에 대해

$$\widetilde{\nabla} J(\theta) = w$$

  — **자연 그래디언트는 별도로 계산할 것도 없이, critic이 배운 가중치 그 자체**라는 정리다. actor-critic 구조([1983년 원형](/papers/actor-critic/))에서 critic을 compatible하게 두면 natural gradient actor-critic이 공짜로 나온다는 뜻으로, 이후 Peters & Schaal의 Natural Actor-Critic이 이 정리 위에 세워진다.

- **"나은 행동"이 아니라 "최선의 행동"으로**: 지수족(예: softmax) 정책에서 일반 그래디언트는 각 행동의 확률을 advantage에 비례해 조금씩 조정하는 방향인 반면, **자연 그래디언트를 따라 충분히 움직이면 정책이 greedy 행동 선택 쪽으로 이동**함을 보인다(무한소가 아닌 유한 스텝의 분석). 정책 개선의 언어로 — 일반 그래디언트는 정책을 "약간 개선"하고, 자연 그래디언트는 policy iteration의 greedy 개선 스텝을 닮아간다.

- **Tetris 실험**: 일반 정책 그래디언트가 사실상 정체하는 Tetris에서 자연 그래디언트가 성능을 자릿수 단위로 끌어올린다. 원인 진단이 유익하다 — 일반 그래디언트는 파라미터 스케일에 민감해 특정 방향으로만 기어가는 반면, 자연 그래디언트는 계량 보정으로 모든 방향의 보폭이 균형 잡힌다.

## 계보에서의 위치

[REINFORCE](/papers/reinforce/)가 연 정책 갈래의 두 번째 근본 문제 — 분산이 아니라 **보폭** — 를 처음 정면으로 다룬 논문이다([Policy Gradient 정리 글](/insight/rl-policy-gradient/)의 후반부가 이 노선이다). $F$가 $n \times n$이라는 계산 장벽 때문에 한동안 소규모 문제에 머물렀지만, 켤레 그래디언트로 $F^{-1}\nabla J$를 근사하고 KL 신뢰 영역 제약으로 다시 쓴 [TRPO](/papers/trpo/)(2015)가 이를 심층 신경망 스케일로 올렸고, 그 제약을 클리핑으로 대체한 [PPO](/papers/ppo/)(2017)가 실무 표준이 됐다 — 계보의 시조가 이 8페이지짜리 논문이다.
