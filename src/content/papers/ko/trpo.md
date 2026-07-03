---
title: "TRPO: 단조 개선이 보장되는 보폭만큼만 정책을 움직여라"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "ICML", "TRPO", "Policy Gradient", "신뢰 영역"]
paper: "Trust Region Policy Optimization"
paperUrl: "https://arxiv.org/abs/1502.05477"
authors: "John Schulman, Sergey Levine, Philipp Moritz, Michael I. Jordan, Pieter Abbeel"
venue: "ICML"
year: 2015
references: ["reinforce", "actor-critic", "natural-policy-gradient"]
description: 옛 정책의 데이터로 새 정책을 평가하는 surrogate objective가 진짜 목적 함수를 KL 발산 페널티만큼의 오차 안에서 하한한다는 부등식을 증명하고, 이를 "평균 KL ≤ δ 제약 하의 surrogate 최대화"라는 실용 알고리즘으로 완화한다. 켤레 그래디언트와 라인 서치로 신경망 정책에서도 natural gradient 방향을 계산해, 보행 제어와 Atari에서 단조에 가까운 안정적 학습을 보인 신뢰 영역 계보의 완성판.
---

## 한 줄 요약

정책 그래디언트의 고질병 — 한 번의 과격한 갱신이 정책을 무너뜨리고, 무너진 정책이 만든 데이터가 복구를 막는 자기 파괴 루프 — 에 대해 이 논문은 이론적 보증으로 답한다: **surrogate 개선량에서 KL 페널티를 뺀 만큼은 진짜 성능도 반드시 개선된다**는 하한 부등식을 증명하고, 그 하한을 최대화하는 minorization-maximization 절차가 단조 개선을 보장함을 보인 뒤, 실용을 위해 페널티를 신뢰 영역 제약으로 바꾼다. [Natural policy gradient](/papers/natural-policy-gradient/)에 "얼마나 가도 되는가"의 정량적 답을 붙인 것이다.

## 핵심 기여

- **성능 차이의 정확한 항등식에서 출발**: 두 정책의 성능 차는 $J(\tilde{\pi}) = J(\pi) + \mathbb{E}_{\tau \sim \tilde{\pi}}[\sum_t \gamma^t A^\pi(s_t, a_t)]$ — 새 정책이 방문하는 상태에서 잰 옛 정책 기준 advantage의 합이다(Kakade & Langford 2002). 문제는 기댓값이 **새 정책의** 상태 분포를 요구한다는 것. 상태 분포를 옛 정책의 것으로 바꿔치기한 국소 근사

$$L_\pi(\tilde{\pi}) = J(\pi) + \mathbb{E}_{s \sim \rho^{\pi},\, a \sim \tilde{\pi}}\big[ A^\pi(s, a) \big]$$

  는 $\pi$ 근방에서 $J$와 1차까지 일치한다 — 행동 분포만 importance sampling으로 보정하면 옛 데이터로 계산 가능한 **surrogate objective**다.

- **단조 개선의 하한 정리**: 논문의 중심 결과 —

$$J(\tilde{\pi}) \;\ge\; L_\pi(\tilde{\pi}) - C \cdot D_{\mathrm{KL}}^{\max}(\pi, \tilde{\pi}), \qquad C = \frac{4 \epsilon \gamma}{(1 - \gamma)^2}$$

  ($\epsilon$은 advantage의 최대 크기). surrogate에서 KL 페널티를 뺀 우변을 매 반복 최대화하면 $J$가 **단조 비감소**함이 MM(minorization-maximization) 논증으로 따라온다. "surrogate를 믿어도 되는 반경은 정책이 얼마나 변했는가(KL)가 정한다"는 직관의 정량화다.

- **이론에서 알고리즘으로 — 두 번의 완화**: 이론의 페널티 계수 $C$는 너무 보수적이어서(스텝이 사실상 0이 된다) (1) 페널티를 **제약**으로 바꾸고 — $\max_\theta L(\theta)$ s.t. $D_{\mathrm{KL}} \le \delta$ — (2) 다루기 힘든 $\max_s$ KL을 **평균** KL로 바꾼다. 결과는 정확히 신뢰 영역(trust region) 문제이고, 목적을 1차·제약을 2차 근사하면 해가 $F^{-1} g$ 방향 — [natural gradient](/papers/natural-policy-gradient/)가 제약 최적화의 형태로 재도출된다.

- **신경망 스케일의 계산**: $F$를 만들지도 뒤집지도 않는다 — Fisher-벡터 곱 $Fv$는 KL의 Hessian-벡터 곱으로 자동미분 두 번이면 되므로, **켤레 그래디언트**로 $F^{-1}g$를 근사하고, 제약 경계까지 스케일한 뒤 **라인 서치**로 "surrogate가 실제로 개선됐고 KL 제약을 지켰는가"를 확인하며 물러선다. advantage 추정용 표본화 방식으로 single path(보통의 궤적)와 vine(상태를 복원해 여러 행동을 가지치기 — 시뮬레이터 전용)을 제시한다.

- **실험**: 같은 하이퍼파라미터 틀로 MuJoCo 보행(swimmer, hopper, walker)을 처음부터 학습시키고, Atari 픽셀 입력에서도 동작함을 보였다 — "연속 제어와 이산 제어를 한 알고리즘으로, 발산 없이"가 당시 기준으로 새로운 지점이었다.

## 계보에서의 위치

[REINFORCE](/papers/reinforce/)의 분산 문제 이후 정책 갈래의 남은 반쪽 — 보폭 — 을 이론([하한 정리])과 실무(CG + 라인 서치) 양쪽에서 닫은 논문으로, [정책 최적화 계보 글](/insight/rl-policy-gradient/)의 축이다. 약점은 무게다: 2차 계산과 라인 서치는 구현이 까다롭고, 파라미터를 공유하는 아키텍처나 대규모 분산 학습과 궁합이 나쁘다. 그래서 2년 뒤 같은 1저자가 신뢰 영역의 효과를 확률비 클리핑 하나로 근사한 [PPO](/papers/ppo/)를 내놓았고 실무의 기본값은 그쪽이 됐다 — 하지만 PPO의 "왜 되는가"를 설명하는 이론은 지금도 이 논문의 하한 부등식이다. advantage 추정 짝인 GAE(Schulman et al. 2016)와 함께 읽으면 현대 on-policy 스택이 완성된다.
