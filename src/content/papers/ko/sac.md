---
title: "SAC: 최대 엔트로피 + off-policy — 연속 제어의 기본값"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "ICML", "SAC", "Actor-Critic", "최대 엔트로피", "연속 제어"]
paper: "Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor"
paperUrl: "https://arxiv.org/abs/1801.01290"
authors: "Tuomas Haarnoja, Aurick Zhou, Pieter Abbeel, Sergey Levine"
venue: "ICML"
year: 2018
references: ["actor-critic", "q-learning", "ppo"]
description: 기대 보상에 정책 엔트로피를 더한 최대 엔트로피 목적을 off-policy actor-critic으로 최적화한다. soft policy iteration의 수렴 증명 위에, 이중 Q 네트워크와 reparameterization으로 실용 알고리즘을 만들어 — 표본 효율은 on-policy(PPO)를, 안정성은 DDPG를 압도하며 Humanoid급 고차원 연속 제어의 표준이 됐다.
---

## 한 줄 요약

2018년의 딜레마: on-policy([PPO](/papers/ppo/), [A3C](/papers/a3c/))는 안정적이지만 그래디언트 스텝마다 새 데이터가 필요해 표본 효율이 나쁘고, off-policy(DDPG)는 replay buffer로 효율적이지만 하이퍼파라미터에 취약해 Humanoid급에서 무너진다. SAC의 답은 목적함수를 바꾸는 것이다 — **보상에 정책의 엔트로피를 더한 최대 엔트로피 목적**을 off-policy actor-critic으로 최적화하면, 탐험이 목적함수에 내장되고 확률적 정책이 학습을 안정화하며 replay buffer의 효율을 그대로 가진다. 이후 로보틱스·연속 제어의 사실상 기본값.

## 핵심 기여

- **최대 엔트로피 목적**: 표준 기대 수익에 상태별 엔트로피 보너스를 더한다.

$$J(\pi) = \sum_t \mathbb{E}_{(s_t, a_t) \sim \rho_\pi} \left[ r(s_t, a_t) + \alpha\, \mathcal{H}(\pi(\cdot \mid s_t)) \right]$$

  온도 $\alpha$가 보상 대 엔트로피의 비중을 정한다. 효과는 세 겹 — 넓은 탐험(성공하는 행동을 **전부** 찾도록 유도), 모델 오차·교란에의 강건성, 다봉(multimodal) 근최적 정책의 표현. [A3C](/papers/a3c/)의 엔트로피 정규화가 보조 트릭이었다면, 여기서는 **목적함수 자체**로 승격됐다.

- **Soft policy iteration — 수렴이 증명된 뼈대**: soft Q의 벨만 backup $\mathcal{T}^\pi Q = r + \gamma\, \mathbb{E}[V(s')]$, $V(s) = \mathbb{E}_{a \sim \pi}[Q(s, a) - \log \pi(a|s)]$로 평가하고, 정책은 Q의 볼츠만 분포로의 정보 사영으로 개선한다.

$$\pi_{new} = \arg\min_{\pi' \in \Pi} D_{KL}\!\left( \pi'(\cdot|s) \,\Big\|\, \frac{\exp(Q^{\pi_{old}}(s, \cdot))}{Z^{\pi_{old}}(s)} \right)$$

  테이블 세팅에서 이 교대가 $\Pi$ 내 최적 정책으로 수렴함을 증명(soft policy iteration) — 벨만의 GPI([서론 글](/insight/rl-origins/))의 최대 엔트로피 버전이다.

- **실용 알고리즘의 부품들**: (1) **이중 Q 네트워크** — 두 개의 $Q_{\theta_1}, Q_{\theta_2}$를 두고 타깃에 $\min$을 사용(clipped double-Q) — [Q-learning](/papers/q-learning/)의 $\max$ 과대추정 편향에 대한 처방, (2) **reparameterization** — 행동을 $a = f_\phi(\epsilon; s)$, $\epsilon \sim \mathcal{N}(0, I)$로 다시 쓰면 정책 그래디언트가 REINFORCE식 score function보다 낮은 분산으로 계산된다, (3) 가우시안 정책을 tanh로 눌러 유계 행동 공간에 맞추고 로그확률을 보정. 모든 갱신이 replay buffer에서 — 완전한 off-policy다.

## 주요 결과

- MuJoCo 벤치마크(Hopper, Walker2d, HalfCheetah, Ant, Humanoid, rllab Humanoid 21차원): 쉬운 태스크에선 동급, **어려운 고차원 태스크에서 압도** — DDPG는 Ant·Humanoid에서 아예 학습 실패, PPO는 도달하지만 훨씬 많은 표본 필요. 동시기의 TD3와 함께 off-policy 연속 제어의 쌍벽.
- **확률적 정책이 안정성의 원천**: 결정론적 변형(DDPG에 근접)은 시드 간 분산이 크지만, 엔트로피 최대화 SAC는 일관되게 안정 — "탐험을 목적에 넣으면 학습 자체가 안정된다"는 논지의 직접 증거.
- 남은 민감 지점은 보상 스케일( = 온도 $\alpha$의 역수 역할) 하나였고, 후속판(SAC v2)이 **엔트로피 타깃 제약 하의 $\alpha$ 자동 튜닝**으로 이마저 제거해 현재의 표준 구현이 된다.

## 계보에서의 위치

[actor-critic](/papers/actor-critic/) 구조에 [Q-learning](/papers/q-learning/)의 off-policy 효율과 최대 엔트로피 프레임(에너지 기반 정책, soft Q-learning 계보)을 결합한 종합이다 — [Value/Policy 지도](/insight/rl-value-policy-map/)의 두 갈래가 가장 촘촘하게 얽힌 지점. 실무 지형은 이렇게 정리됐다: 시뮬레이션·병렬화가 싸면 [PPO](/papers/ppo/), 실제 로봇처럼 **표본이 비싸면 SAC** — 실물 로봇 학습(후속 논문에서 시간당 걷기 학습)이 그 증거다. "엔트로피를 목적에 넣는다"는 사상은 RL 밖으로도 번져, LLM 정렬에서 분포 붕괴를 막는 엔트로피/KL 보너스 설계에 같은 논리가 재등장한다.
