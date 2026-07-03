---
title: "강화학습의 근간 (6): Model-free Control — ε-greedy에서 DQN까지"
date: 2026-07-03
draft: false
category: 개념 정리
series: 강화학습의 근간
tags: ["강화학습", "머신 러닝", "Q-learning", "SARSA", "off-policy", "DQN"]
description: 예측을 제어로 격상시키는 데 필요한 부품을 순서대로 조립한다 — 왜 V가 아니라 Q를 배워야 하는지, greedy가 왜 실패하고 ε-greedy가 무엇을 보장하는지(GLIE 조건과 GLIE-MC control), TD로 평가를 바꾼 on-policy SARSA와 SARSA(λ), 그리고 행동하는 정책과 배우는 정책을 분리하는 off-policy 학습 — importance sampling의 원리와 분산 문제, max로 그것을 우회하는 Q-learning, 함수 근사의 발산 문제를 replay buffer와 target network로 눌러 deep RL을 연 DQN까지.
tldr:
  - model-free control의 두 가지 수정 — 모델 없이 greedy 개선을 하려면 V가 아니라 Q를 배워야 하고, 탐험을 보장하려면 greedy가 아니라 ε-greedy로 개선해야 한다. GLIE 조건(모든 상태-행동 무한 방문 + ε→0)을 채우면 MC control이 Q*로 수렴한다.
  - SARSA는 (S,A,R,S',A') — 자기가 실제 한 다음 행동으로 갱신하는 on-policy TD control이고, Q-learning은 max_a Q(S',a) — 실제 행동과 무관하게 greedy 표적으로 갱신하는 off-policy TD control이다.
  - 일반적 off-policy 학습의 도구는 importance sampling이지만 궤적이 길수록 분산이 폭발한다. Q-learning은 표적 정책이 greedy라는 특수 구조 덕에 IS 없이 off-policy가 되고, 이 성질이 replay buffer를 가능하게 해 DQN으로 직결된다.
  - DQN = Q-learning + 신경망 + experience replay + target network. 뒤의 두 부품은 함수 근사·bootstrapping·off-policy가 만나는 deadly triad의 불안정을 상관 제거와 표적 고정으로 눌러낸 것이다.
prerequisites:
  - MC/TD 예측과 TD(λ) ("[강화학습의 근간 (4)](/insight/rl-mc-td/)")
  - 탐험-활용 딜레마와 regret ("[강화학습의 근간 (5)](/insight/rl-bandits-ucb/)")
  - GPI 개념 ("[강화학습의 근간 (3)](/insight/rl-dynamic-programming/)")
---

## 예측에서 제어로 — 무엇이 더 필요한가

[앞 글](/insight/rl-mc-td/)에서 주어진 정책의 가치를 표본으로 추정하는 법(MC, TD)을 얻었다. 이제 목표는 **제어(control)** — 최적 정책 자체를 찾는 것이다. 설계도는 이미 있다: [(3)의 GPI](/insight/rl-dynamic-programming/) — 평가와 greedy 개선을 번갈아 돌리면 된다. DP의 평가를 MC/TD로 바꿔 끼우기만 하면 될 것 같지만, 그 순간 두 가지가 부러진다. 이 글은 그 두 군데를 고치는 것에서 시작해 DQN까지 간다.

**첫째, $V$로는 greedy 개선을 못 한다.** DP의 개선은 $\pi'(s) = \arg\max_a \big( \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a V(s') \big)$였다 — **모델이 식 안에 들어 있다.** model-free 세계에서는 이 식을 계산할 수 없다. 해법은 [(2)에서 예고한 대로](/insight/rl-mdp/) 행동 가치를 배우는 것: $Q(s,a)$가 있으면 개선이 $\pi'(s) = \arg\max_a Q(s,a)$ — 모델 없이 조회 한 번이다. **model-free control은 반드시 $Q$를 배운다.**

**둘째, greedy 개선은 탐험을 죽인다.** DP는 full-width backup이라 모든 행동의 가치가 항상 정확히 계산됐지만, 표본 기반 평가에서는 **해본 행동의 가치만 갱신**된다. 순수 greedy로 행동하면 초기 추정이 우연히 낮은 행동은 영원히 선택되지 않고, 영원히 갱신되지 않는다 — [앞 글](/insight/rl-bandits-ucb/)의 밴딧 언어로 말하면, greedy는 차선에 갇혀 **선형 regret**을 내는 전략이다.

## ε-greedy와 GLIE — 탐험의 최소 보장

가장 단순한 수리가 **ε-greedy**다:

$$\pi(a \mid s) = \begin{cases} 1 - \varepsilon + \dfrac{\varepsilon}{|\mathcal{A}|} & a = \arg\max_{a'} Q(s, a') \\[4pt] \dfrac{\varepsilon}{|\mathcal{A}|} & \text{그 외} \end{cases}$$

확률 $1-\varepsilon$로 최선을, $\varepsilon$으로 무작위를 고른다. 조잡해 보여도 이론적 지위가 확실하다 — **ε-greedy 개선도 정책 개선 정리를 만족한다**(ε-greedy 정책들의 집합 안에서, 새 $Q$에 대한 ε-greedy는 이전 ε-greedy 이상임이 증명된다). 즉 GPI의 "개선" 자리에 greedy 대신 끼워도 단조 개선이 유지된다.

그런데 ε을 어떻게 다뤄야 **최적**까지 갈까? ε을 고정하면 영원히 ε만큼 무작위 행동이 섞인 정책에 머문다 — [앞 글](/insight/rl-bandits-ucb/)에서 본 고정 ε-greedy의 선형 regret이 MDP에서도 그대로 재현되는 것이다. 답이 **GLIE(Greedy in the Limit with Infinite Exploration)** 조건이다:

1. 모든 상태-행동 쌍이 무한히 방문된다: $N_k(s, a) \to \infty$
2. 정책이 극한에서 greedy로 수렴한다: 예컨대 $\varepsilon_k = 1/k$로 감쇠

**탐험은 끝없이, 그러나 점점 greedy하게.** 두 조건이 "모든 것을 계속 확인하면서도 결국은 최선에 집중한다"는 상충 요구를 동시에 채운다.

이제 첫 번째 완전한 model-free control 알고리즘이 조립된다 — **GLIE-MC control**: 에피소드를 ε-greedy로 굴리고, 방문한 $(s,a)$마다

$$N(S_t, A_t) \leftarrow N(S_t, A_t) + 1, \qquad Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \frac{1}{N(S_t, A_t)} \big( G_t - Q(S_t, A_t) \big)$$

로 평가하고, $\varepsilon = 1/k$로 개선한다. **GLIE 조건 하에서 $Q \to Q^*$가 증명**된다 — 모델 없이, 경험만으로, 최적에 도달하는 최초의 보장이다.

## SARSA — 평가를 TD로 바꾸면

MC 평가의 약점(에피소드 끝까지 대기, 높은 분산)은 앞 글 그대로다. 평가를 TD(0)로 바꾸면 매 스텝 갱신하는 control이 된다. 상태가 아니라 상태-행동 쌍에 대한 TD:

$$Q(S, A) \leftarrow Q(S, A) + \alpha \big( R + \gamma Q(S', A') - Q(S, A) \big)$$

갱신에 쓰이는 다섯 값 $(S, A, R, S', A')$이 이름이 됐다 — **SARSA**. 여기서 $A'$은 **에이전트가 $S'$에서 실제로 고른(ε-greedy로) 다음 행동**이다. 즉 SARSA는 **자기가 실제로 행동하는 그 정책의 가치를 배운다** — 탐험으로 절벽에 떨어지는 위험까지 가치에 반영된다(cliff-walking에서 SARSA가 안전한 우회로를, Q-learning이 절벽 옆 최단로를 배우는 고전적 대비의 이유). 이런 방식을 **on-policy**라 부른다. GLIE에 스텝 크기 조건(Robbins-Monro: $\sum \alpha_t = \infty$, $\sum \alpha_t^2 < \infty$)을 더하면 SARSA도 $Q^*$로 수렴한다.

앞 글의 λ 손잡이도 그대로 이식된다 — n-step Q-return과 $q_t^\lambda$를 정의하면 forward view **SARSA(λ)**, 상태-행동 쌍에 eligibility trace $E_t(s,a)$를 두면 backward view SARSA(λ)가 되어, 한 번의 보상이 그 에피소드에서 지나온 행동들 전체에 감쇠 배분된다.

## Off-policy — 행동과 학습의 분리

on-policy의 제약을 보자: 배우는 정책 = 행동하는 정책이므로, **정책이 갱신되면 이전 정책이 만든 데이터는 버려야 한다.** 데이터가 비싼 세계(로봇, 인간 시연)에서 치명적이다. 그래서 묻게 된다 — **행동은 정책 $\mu$(behavior policy)로 하면서, 다른 정책 $\pi$(target policy)의 가치를 배울 수 없을까?** 이것이 **off-policy 학습**이고, 가능해지면 세 가지가 열린다: 과거 정책의 데이터 재사용(replay), 타인/인간의 시연에서 학습, 탐험적으로 행동하며 greedy 정책을 학습.

일반적 도구는 **importance sampling(IS)** 이다 — 분포 $\mu$의 표본으로 분포 $\pi$ 하의 기댓값을 추정하려면, 각 표본에 확률 비율을 곱해 보정한다:

$$\mathbb{E}_{x \sim \pi}[f(x)] = \mathbb{E}_{x \sim \mu}\!\left[ \frac{\pi(x)}{\mu(x)} f(x) \right]$$

MC에 적용하면 궤적 전체의 비율이 곱해진다:

$$\rho_t^{T} = \prod_{k=t}^{T-1} \frac{\pi(A_k \mid S_k)}{\mu(A_k \mid S_k)}, \qquad V(S_t) \leftarrow V(S_t) + \alpha \big( \rho_t^T G_t - V(S_t) \big)$$

무편향이지만 — 비율의 **곱**이라는 게 재앙이다. 스텝마다 1에서 벗어난 비율이 수십 개 곱해지면 추정치의 분산이 지수적으로 폭발하고, $\mu$가 0을 주는 행동을 $\pi$가 원하면 아예 정의되지 않는다. **off-policy MC는 사실상 실용 불가**다. TD는 한 스텝만 bootstrap하므로 비율이 한 개만 붙어($\rho_t = \frac{\pi(A_t|S_t)}{\mu(A_t|S_t)}$) 훨씬 낫지만, 분산 대가는 여전히 있다. IS 자체는 이후 [(7)의 PPO](/insight/rl-policy-gradient/)에서 "옛 정책 데이터로 새 정책을 평가"하는 surrogate objective로 다시 등장하는 핵심 도구이니 여기서 확실히 챙겨두자.

## Q-learning — IS 없는 off-policy

그런데 표적 정책이 **greedy라는 특수한 경우**에는 IS가 아예 필요 없다. [(3)에서 예고한 치환](/insight/rl-dynamic-programming/) — $Q$에 대한 value iteration의 기댓값을 표본 하나로 바꾸면:

$$Q(S, A) \leftarrow Q(S, A) + \alpha \big( R + \gamma \max_{a'} Q(S', a') - Q(S, A) \big)$$

**[Q-learning](/papers/q-learning/)** 이다. SARSA와의 차이는 표적의 한 자리뿐 — 실제 한 행동의 $Q(S', A')$ 대신 $\max_{a'} Q(S', a')$. 이 $\max$가 개념적으로 하는 일: 표적을 "**내가 실제로 뭘 했든, $S'$에서 최선을 한다면**"으로 만든다. 갱신에 필요한 것은 $(S, A, R, S')$까지고, 그 이후를 어느 정책으로 행동했는지는 표적에 안 들어간다 — **행동 정책이 무엇이든(충분히 탐험만 한다면) greedy 정책의 가치 $Q^*$를 배우는 off-policy 알고리즘**이 IS 없이 성립하는 것이다. Watkins의 수렴 증명(모든 쌍 무한 방문 + Robbins-Monro 조건 하에 $Q \to Q^*$)이 이를 닫는다.

정리하면, on/off-policy 축의 두 대표는 표적 한 자리로 갈린다:

$$\text{SARSA: } R + \gamma\, Q(S', A') \quad\text{vs}\quad \text{Q-learning: } R + \gamma \max_{a'} Q(S', a')$$

## DQN — 함수 근사, 그리고 deadly triad

지금까지의 $Q$는 표(table)였다 — 상태 수만큼 칸이 있는. 바둑($10^{170}$ 상태)이나 픽셀 입력에서는 불가능하므로 $Q(s, a; \theta)$를 신경망으로 근사해야 한다. 그런데 순진하게 Q-learning 갱신을 그래디언트로 옮기면 발산하기 일쑤다. 원인은 **deadly triad** — (1) 함수 근사, (2) bootstrapping(표적에 자기 추정이 들어감), (3) off-policy, 셋이 모이면 안정성 보장이 무너진다는 고전적 결과다. 구체적으로 신경망에서는: 연속된 표본이 강하게 상관되어 있고(i.i.d. 가정 붕괴), 표적 $R + \gamma \max Q(S', a'; \theta)$가 갱신하는 파라미터 $\theta$ 자신에 의존해 **표적이 학습을 따라 움직인다**(개가 제 꼬리를 쫓는 구도).

**[DQN](/papers/dqn/)**(2013/2015, Atari)은 이 둘을 부품 두 개로 눌렀다:

- **Experience replay**: 전이 $(s, a, r, s')$를 버퍼에 쌓고 무작위 미니배치로 학습 — 시간 상관을 깨고, 데이터를 재사용한다. **Q-learning이 off-policy이기에 가능한 설계**임에 주목하라. 버퍼 속 데이터는 과거 정책들이 만든 것이므로, on-policy인 SARSA로는 이 버퍼를 쓸 수 없다.
- **Target network**: 표적 계산에 별도의 고정 파라미터 $\theta^-$를 쓰고 주기적으로만 동기화:

$$\mathcal{L}(\theta) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}} \left[ \big( r + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta) \big)^2 \right]$$

— 움직이던 표적을 한동안 못박아 회귀 문제로 만든다.

같은 CNN 하나가 픽셀에서 49개 Atari 게임을 사람 수준으로 배우면서 deep RL 시대가 열렸고, 이후의 개선들 — $\max$의 과대추정 편향을 행동 선택/평가 분리로 고친 Double DQN, 벨만 오차 큰 전이를 우선 재생하는 prioritized replay((3)의 prioritized sweeping의 후손), $V$와 advantage를 분리한 dueling — 은 전부 이 골격 위의 패치다.

## 다음 글

여기까지가 **가치 기반** 갈래의 종주다: 가치를 배우고 정책은 $\arg\max$로 유도한다. 그런데 이 $\arg\max$ 자체가 족쇄다 — 연속 행동에서는 매 스텝 최적화 문제가 되고, 확률적 정책은 표현할 수 없다. [다음 글](/insight/rl-policy-gradient/)은 반대편 갈래 — 정책을 직접 파라미터화해 그래디언트로 미는 policy gradient — 를 [REINFORCE](/papers/reinforce/)에서 Fisher 정보 행렬과 natural gradient, TRPO를 거쳐 [PPO](/papers/ppo/)까지 따라간다.
