---
title: "강화학습의 근간 (9): Value와 Policy — 두 갈래의 지도"
date: 2026-07-03
draft: false
category: 개념 정리
series: 강화학습의 근간
tags: ["강화학습", "머신 러닝", "Q-learning", "Policy Gradient", "Actor-Critic"]
description: 강화학습 알고리즘 전체를 가치 기반과 정책 기반의 양분 구도로 정리한다 — 각 갈래의 논리와 약점, ε-greedy와 탐험 문제, on-policy/off-policy 구분, 그리고 두 갈래가 actor-critic에서 합쳐져 A3C·PPO·SAC로 이어지는 계보도까지.
tldr:
  - 가치 기반은 "얼마나 좋은지"를 배우고 정책은 그로부터 유도한다(Q-learning 계열, 이산 행동·off-policy에 강함). 정책 기반은 정책 자체를 파라미터화해 기대 수익의 그래디언트를 직접 오른다(REINFORCE 계열, 연속 행동·확률적 정책에 강함).
  - ε-greedy는 탐험-활용 딜레마의 최소 해법이고, on-policy/off-policy 구분은 "지금 배우는 정책과 데이터를 만든 정책이 같은가"라는, 알고리즘 설계 전체를 가르는 축이다.
  - Actor-critic은 정책(actor)의 그래디언트를 가치(critic)의 TD 오차로 안내하는 결합 구조이며, A2C/A3C → PPO(신뢰 영역), SAC(최대 엔트로피 + off-policy)가 그 현대적 완성형이다.
prerequisites:
  - MDP와 벨만 방정식 ("[강화학습의 근간 (2)](/insight/rl-mdp/)")
  - model-free 예측과 제어 ("[강화학습의 근간 (4)](/insight/rl-mc-td/)", "[(6)](/insight/rl-model-free-control/)")
---

## 하나의 목표, 두 개의 경로

시리즈를 닫는 지도다 — (2)~(8)에서 부품 단위로 쌓은 것을 한 장으로 접는다. 강화학습의 목표는 하나다 — 기대 누적 보상을 최대화하는 정책 $\pi(a|s)$ 찾기. 경로가 둘로 갈라진다.

**가치 기반(value-based)**: "각 상태(-행동)가 얼마나 좋은지"를 먼저 배우고, 정책은 그 가치에 대한 greedy 선택으로 **유도**한다. $Q^*(s,a)$만 알면 $\pi^*(s) = \arg\max_a Q^*(s,a)$가 공짜다 — [Q-learning](/papers/q-learning/)의 노선이다.

**정책 기반(policy-based)**: 가치를 거치지 않고 정책 자체를 $\pi_\theta$로 파라미터화한 뒤, 기대 수익 $J(\theta)$의 그래디언트를 직접 오른다 — [REINFORCE](/papers/reinforce/)의 노선이다.

이 양분은 취향이 아니라 문제 구조의 문제다. 가치 기반의 $\arg\max$는 행동이 이산이고 적을 때만 실용적이고(연속 행동에서 매 스텝 최적화 문제가 생긴다), 결정적 greedy 정책만 표현한다. 정책 기반은 연속 행동과 확률적 정책이 자연스럽지만, 그래디언트 추정의 분산이 크고 표본 효율이 나쁘다. **각자의 약점이 상대의 강점**이라는 이 구도가 이후 모든 통합 시도의 동기다.

## 가치 갈래의 부품들

- **TD 학습**: 에피소드가 끝나기를 기다리지 않고(몬테카를로), 다음 스텝의 추정치로 지금의 추정치를 갱신한다 — $V(s) \leftarrow V(s) + \alpha[\,r + \gamma V(s') - V(s)\,]$. 추정으로 추정을 갱신하는 **bootstrapping**이 핵심이다 — MC와의 편향-분산 대비, 그리고 둘을 잇는 TD(λ)는 [(4)](/insight/rl-mc-td/)에서, 원전은 [TD 학습 리뷰](/papers/td-learning/)에서 다룬다.
- **ε-greedy와 탐험**: greedy로만 행동하면 초기 추정의 우연에 갇힌다(탐험-활용 딜레마). ε-greedy는 최소한의 해법 — 확률 $1-\varepsilon$로 최선 행동, $\varepsilon$로 무작위 행동. 조잡해 보이지만 "모든 상태-행동을 무한히 방문한다"는 수렴 조건(GLIE — [(6)](/insight/rl-model-free-control/) 참고)을 채워주는, 이론과 실무 양쪽의 기본값이다. 탐험의 이론적 바닥(regret 하한)과 그 바닥에 도달하는 UCB는 [(5)](/insight/rl-bandits-ucb/)에서 다뤘고, UCB가 실전에서 빛나는 곳이 [(8)의 MCTS](/insight/rl-planning-mcts/)다 — 카운트 기반·내재적 보상 같은 심층 탐험 연구는 전부 같은 낙관주의의 확장으로 읽으면 된다.
- **on-policy vs off-policy**: **배우려는 정책과 데이터를 만든 정책이 같은가?** SARSA는 자기가 실제 한 행동으로 갱신하고(on-policy — ε-greedy의 탐험까지 반영된 가치를 배운다), [Q-learning](/papers/q-learning/)은 실제 행동과 무관하게 $\max$로 갱신한다(off-policy — 탐험하면서도 greedy 정책의 가치를 배운다). 일반적 off-policy 보정 도구인 importance sampling과 Q-learning이 그것을 우회하는 구조는 [(6)](/insight/rl-model-free-control/)에서 다뤘다. off-policy는 과거 데이터 재사용(replay buffer)을 열어 표본 효율의 열쇠가 되지만, 함수 근사·bootstrapping과 만나면 발산할 수 있다(deadly triad). 이 축은 뒤의 모든 알고리즘을 분류하는 기준이다 — A3C/PPO는 on-policy, Q-learning/DQN/SAC는 off-policy.
- **모델의 재사용**: 경험으로 환경 모델을 배우고, 그 모델이 만든 모의 경험으로 **같은 Q-learning 갱신을 증폭**하면? — [Dyna-Q](/papers/dyna-q/)다. 분류에 주의할 것: Dyna-Q는 "월드 모델" 계열이 아니라 **Q-learning의 발전형**(표본 효율 증강)이고, 잠재 공간에서 상상 궤적을 굴리는 [World Models](/papers/world-models/)·[Dreamer](/papers/dreamer/) 계열은 "배운 모델 안에서 학습한다"는 정신만 공유하는 한참 뒤의 다른 노선이다 — 상세 구분은 [(8)](/insight/rl-planning-mcts/) 참고.

## 정책 갈래의 부품들

REINFORCE의 그래디언트 $\nabla J = \mathbb{E}[\nabla \log \pi_\theta(a|s) \cdot G_t]$는 편향은 없지만 분산이 크다 — 수익 $G_t$가 통째로 곱해지기 때문이다. 개선의 역사는 분산 축소의 역사다: 상수 baseline을 빼고(REINFORCE 논문에 이미 있다), baseline을 상태 가치 $V(s)$로 바꾸면 $G_t - V(s)$, 즉 **advantage**가 된다 — 그리고 $V$를 배우는 순간, 정책 갈래는 가치 갈래를 다시 불러들인 것이다. 분산과 함께 이 갈래의 다른 반쪽 문제인 **보폭** — Fisher 정보 행렬과 natural gradient, TRPO를 거쳐 PPO의 클리핑에 이르는 — 은 [(7)](/insight/rl-policy-gradient/)에서 수식으로 따라갔다.

## 합류 — Actor-Critic

그렇게 만난 구조가 **actor-critic**이다: 정책(actor)이 행동하고, 가치 추정기(critic)의 TD 오차가 "방금 행동이 기대보다 좋았는지"를 알려주며 actor의 그래디언트를 안내한다. 놀랍게도 이 구조는 정책 그래디언트 정리(1999)보다 훨씬 먼저 — [1983년의 cart-pole 논문](/papers/actor-critic/)에서 — 공학적 직관으로 먼저 발명됐다.

현대의 계보는 이 구조의 정련이다:

- **[A3C/A2C](/papers/a3c/)** (2016): advantage actor-critic을 병렬 환경으로 안정화 — replay buffer 없이 on-policy로 deep RL을 성립시켰다.
- **[PPO](/papers/ppo/)** (2017): 정책 갱신의 보폭을 클리핑으로 제한(신뢰 영역의 단순화) — on-policy 계열의 실무 표준이 됐고, [InstructGPT](/papers/instructgpt/)를 통해 LLM 정렬까지 갔다.
- **[SAC](/papers/sac/)** (2018): off-policy actor-critic + 최대 엔트로피 목적 — 표본 효율과 안정성을 동시에 잡아 연속 제어(로보틱스)의 표준이 됐다.

지도를 한 장으로 접으면: **가치 갈래는 "무엇이 좋은지 알면 행동은 따라온다", 정책 갈래는 "행동을 직접 고쳐라", actor-critic은 "가치로 안내하고 정책으로 행동하라"** — 그리고 2016년 이후의 실전 알고리즘은 사실상 전부 세 번째 답의 변주다.

고전 시리즈는 여기서 닫힌다. 이 부품들이 언어 모델의 세계 — RLHF와 DPO, 검증자(ORM/PRM/GRM), 그리고 o1-like 추론 모델(GRPO, R1, MCTS 기반 self-evolution) — 에서 어떻게 재조립되는지는 [확장편 (10)](/insight/rl-llm/)에서 다룬다.
