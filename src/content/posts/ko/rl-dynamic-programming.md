---
title: "강화학습의 근간 (3): 동적 계획법 — 벨만 방정식을 실제로 푸는 법"
date: 2026-07-03
draft: false
category: 개념 정리
series: 강화학습의 근간
tags: ["강화학습", "머신 러닝", "동적 계획법", "MDP", "Bellman Equation"]
description: 모델을 완전히 아는 세계에서 벨만 방정식을 푸는 동적 계획법을 강화학습의 관점에서 정리한다 — 벨만 기대 방정식을 반복 대입으로 푸는 policy evaluation, 평가와 greedy 개선을 번갈아 최적에 도달하는 policy iteration(개선 정리의 증명 스케치 포함), 평가를 한 스텝으로 줄인 value iteration, 수렴을 보장하는 축약 사상 논증, 그리고 full-width backup의 한계가 어떻게 표본 기반 강화학습의 문제 정의가 되는지까지.
tldr:
  - Policy evaluation은 벨만 기대 방정식을 갱신 규칙으로 바꿔 반복 대입하는 것이고, γ-축약 사상이므로 유일한 해 V^π로 반드시 수렴한다.
  - Policy iteration은 "평가 → greedy 개선"의 반복이다. 정책 개선 정리가 greedy 한 스텝이 정책을 절대 나쁘게 만들지 않음을 보장하고, 유한 MDP에서 유한 번 만에 최적 정책에 도달한다.
  - Value iteration은 평가를 끝까지 돌리지 않고 벨만 최적 방정식 자체를 갱신 규칙으로 쓰는 것 — policy iteration의 평가를 1스텝으로 자른 극단이며, 둘 사이의 스펙트럼 전체가 GPI(Generalized Policy Iteration)다.
  - DP의 backup은 다음 상태 전부를 훑는 full-width backup이라 모델과 작은 상태 공간을 요구한다. 이 두 요구를 표본(sample backup)으로 대체하는 것이 곧 model-free 강화학습이다.
prerequisites:
  - MDP, 벨만 기대/최적 방정식 ("[강화학습의 근간 (2)](/insight/rl-mdp/)" 참고)
---

## 가장 좋은 조건에서 시작한다

[앞 글](/insight/rl-mdp/)의 결론은 "강화학습의 남은 이야기는 전부 벨만 (최적) 방정식을 푸는 법"이라는 것이었다. 그렇다면 가장 좋은 조건 — **환경 모델 $\mathcal{P}_{ss'}^a$, $\mathcal{R}_s^a$를 완전히 알고, 상태를 전부 훑을 수 있는 세계** — 에서 어떻게 푸는지를 먼저 알아야 한다. 그 답이 벨만 자신이 만든 **동적 계획법(dynamic programming, DP)** 이고, 이 글의 알고리즘 세 개(policy evaluation, policy iteration, value iteration)는 이후 모든 강화학습 알고리즘의 원형이다. Q-learning은 value iteration의 표본판이고, actor-critic은 policy iteration의 근사판이다 — 원형을 모르면 근사판의 설계가 전부 임의로 보인다.

미리 용어 하나: 모델을 알고 계산만 하는 이 설정을 **planning**이라 부르고, 모델 없이 경험에서 배우는 설정을 좁은 의미의 **learning**이라 부른다. DP는 planning이다 — 즉 엄밀히는 아직 "강화학습"이 아니고, 강화학습이 근사하려는 대상이다.

## Policy Evaluation — 주어진 정책은 얼마나 좋은가

**예측(prediction) 문제**: 정책 $\pi$가 주어졌을 때 $V^\pi$를 구하라. 답은 벨만 기대 방정식

$$V^\pi(s) = \sum_a \pi(a \mid s) \left( \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a V^\pi(s') \right)$$

인데, 이는 미지수 $|\mathcal{S}|$개짜리 연립 선형 방정식이므로 원리적으로는 역행렬로 풀린다. DP의 통찰은 **방정식을 갱신 규칙으로 바꾸는 것**이다:

$$V_{k+1}(s) \leftarrow \sum_a \pi(a \mid s) \left( \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a V_k(s') \right) \quad \forall s$$

아무 $V_0$(보통 0)에서 시작해 이 **반복 대입(iterative policy evaluation)** 을 돌리면 $V_k \to V^\pi$로 수렴한다. 한 상태의 새 값을 다음 상태들의 현재 추정치로 계산하는 이 연산을 **backup**이라 부른다 — 미래의 추정이 현재로 "되돌아와(back up)" 반영된다는 뜻이고, 강화학습 전체에서 가장 자주 쓰게 될 단어다.

수렴이 보장되는 이유는 깔끔하다. 벨만 기대 연산자 $T^\pi$는 최대 노름에 대해 **$\gamma$-축약 사상(contraction mapping)** 이다:

$$\lVert T^\pi V - T^\pi V' \rVert_\infty \le \gamma \lVert V - V' \rVert_\infty$$

— 한 번 적용할 때마다 임의의 두 추정 사이 거리가 최소 $\gamma$배로 줄어든다. 바나흐 고정점 정리에 의해 고정점($V^\pi$)은 유일하고, 어디서 시작하든 기하급수적 속도로 수렴한다. $\gamma < 1$이 단순한 취향이 아니라 **수렴의 엔진**임을 보여주는 대목이다.

## Policy Improvement — 평가를 개선으로 바꾸는 정리

$V^\pi$를 알았다고 하자. 이걸로 $\pi$보다 나은 정책을 만들 수 있을까? 각 상태에서 **한 스텝만 greedy하게** 다시 고르면 된다:

$$\pi'(s) = \arg\max_a Q^\pi(s, a) = \arg\max_a \left( \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a V^\pi(s') \right)$$

**정책 개선 정리(policy improvement theorem)**: 이렇게 만든 $\pi'$는 모든 상태에서 $V^{\pi'}(s) \ge V^\pi(s)$다. 증명의 뼈대는 한 줄짜리 관찰의 반복이다 — greedy 선택이니까 $Q^\pi(s, \pi'(s)) \ge Q^\pi(s, \pi(s)) = V^\pi(s)$인데, 이 부등식을 전개하면

$$V^\pi(s) \le Q^\pi(s, \pi'(s)) = \mathbb{E}_{\pi'}[R_{t+1} + \gamma V^\pi(S_{t+1}) \mid S_t = s] \le \mathbb{E}_{\pi'}[R_{t+1} + \gamma Q^\pi(S_{t+1}, \pi'(S_{t+1})) \mid S_t = s] \le \cdots \le V^{\pi'}(s)$$

— "첫 스텝만 $\pi'$로"를 "첫 두 스텝만 $\pi'$로", "첫 세 스텝만…"으로 밀어가면 결국 전부 $\pi'$를 따르는 가치에 도달하고, 매 단계 부등호가 유지된다. 그리고 개선이 멈추는 순간 — $\pi' = \pi$가 되어 등호가 성립하는 순간 — 위 식은 벨만 **최적** 방정식이 된다. 즉 **greedy 개선이 더 이상 아무것도 못 바꾸면 그 정책은 이미 최적**이다.

이 정리가 이 글에서 가장 중요한 결과다. "가치를 평가하고 → greedy로 개선한다"는 루프가 왜 작동하는지에 대한 보증이고, 이 보증이 (6)의 model-free control에서 "$Q^\pi$ 추정 + ε-greedy 개선"으로 그대로 이식된다.

## Policy Iteration — 평가와 개선의 왕복

정리를 알고리즘으로 만들면 **policy iteration**:

$$\pi_0 \xrightarrow{\text{평가}} V^{\pi_0} \xrightarrow{\text{greedy}} \pi_1 \xrightarrow{\text{평가}} V^{\pi_1} \xrightarrow{\text{greedy}} \pi_2 \longrightarrow \cdots \longrightarrow \pi^*$$

매 라운드 정책이 단조 개선되고, 유한 MDP의 결정적 정책은 유한 개($|\mathcal{A}|^{|\mathcal{S}|}$)뿐이므로 **유한 번 만에 최적 정책에 도달**한다. 실전에서는 놀랄 만큼 적은 라운드로 끝나는 경우가 많다.

그런데 낭비가 보인다: 개선에 필요한 것은 $\arg\max$의 순위뿐인데, 평가를 매번 수렴할 때까지 돌릴 필요가 있을까? 평가를 $k$번의 반복 대입으로 자르는 **modified policy iteration**이 자연스럽고, 극단으로 $k = 1$까지 자르면—

## Value Iteration — 최적 방정식을 직접 반복한다

평가 1스텝 + greedy 개선을 합치면 갱신이 하나로 접힌다:

$$V_{k+1}(s) \leftarrow \max_a \left( \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a V_k(s') \right)$$

**벨만 최적 방정식 자체를 갱신 규칙으로 쓰는 것** — 이것이 value iteration이다. 명시적인 정책이 등장하지 않고(중간의 $V_k$는 어떤 실제 정책의 가치도 아닐 수 있다), 벨만 최적 연산자 역시 $\gamma$-축약이므로 $V_k \to V^*$가 보장된다. 수렴 후 $V^*$에 대한 greedy 정책을 뽑으면 $\pi^*$다.

같은 구조의 $Q$ 버전도 그대로 성립한다:

$$Q_{k+1}(s, a) \leftarrow \mathcal{R}_s^a + \gamma \sum_{s'} \mathcal{P}_{ss'}^a \max_{a'} Q_k(s', a')$$

이 식을 눈에 익혀두자 — **기댓값 $\sum_{s'} \mathcal{P}_{ss'}^a$를 표본 하나로 바꾸면 정확히 [Q-learning](/papers/q-learning/)** 이다. (6)에서 이 치환 한 번으로 model-free control이 열린다.

## GPI — 전부를 하나의 그림으로

Policy iteration(평가를 끝까지)과 value iteration(평가를 1스텝)은 스펙트럼의 양끝이고, 그 사이 전부가 유효하다. Sutton & Barto는 이를 **GPI(Generalized Policy Iteration)** 로 일반화한다: **어떤 방식으로든 가치 추정을 $V^\pi$ 쪽으로 밀고(평가), 어떤 방식으로든 정책을 가치에 대해 greedy 쪽으로 미는(개선) 두 과정이 상호작용하면, 그 상호작용의 고정점은 $(\pi^*, V^*)$뿐이다.** 두 과정은 서로를 표적으로 삼아 움직이는 경쟁 관계이면서, 동시에 서로를 최적으로 끌어올리는 협력 관계다.

GPI가 중요한 이유는 이후 알고리즘들의 분류 틀이 되기 때문이다 — MC control은 "MC 평가 + ε-greedy 개선"의 GPI, SARSA는 "TD 평가 + ε-greedy 개선"의 GPI, actor-critic은 "critic의 평가 + actor의 개선"의 GPI다. **강화학습 알고리즘을 새로 만나면 '평가는 무엇으로, 개선은 무엇으로 하는가'부터 물으면 된다.**

실무적 각주 둘. 첫째, 모든 상태를 한 번에 갱신하는 동기(synchronous) backup 대신 상태를 하나씩, 임의 순서로, 최신 값을 바로 써서 갱신하는 **비동기(asynchronous) DP** — in-place 갱신, 벨만 오차가 큰 상태부터 갱신하는 prioritized sweeping, 실제 궤적이 방문한 상태만 갱신하는 real-time DP — 도 수렴하며, 계산을 크게 아낀다. "중요한 상태부터 갱신한다"는 발상은 DQN 계열의 prioritized experience replay로 이어진다. 둘째, 수렴 판정은 보통 $\max_s |V_{k+1}(s) - V_k(s)|$가 임계값 아래로 떨어질 때다.

## DP의 두 한계 — 그대로 강화학습의 문제 정의가 된다

DP의 backup을 다시 보자:

$$V(s) \leftarrow \max_a \Big( \mathcal{R}_s^a + \gamma \underbrace{\sum_{s'} \mathcal{P}_{ss'}^a V(s')}_{\text{다음 상태 전부를 훑는다}} \Big)$$

이것은 **full-width backup**이다 — 한 상태를 갱신하려면 가능한 모든 행동과 모든 다음 상태를 훑고, 그러려면 (1) $\mathcal{P}$와 $\mathcal{R}$을 알아야 하고 (2) 상태 공간이 열거 가능해야 한다. 벨만이 "차원의 저주"라 부른 (2)는 상태 변수가 늘 때 상태 수가 지수적으로 느는 문제고, (1)은 애초에 현실 대부분의 문제에서 모델이 주어지지 않는다는 문제다.

강화학습의 답은 하나의 치환이다: **full-width backup을 표본 backup(sample backup)으로 바꾼다.** 기댓값 $\sum_{s'} \mathcal{P}_{ss'}^a(\cdot)$ 대신 실제로 겪은 전이 $(s, a, r, s')$ 하나로 갱신하는 것 — 모델이 필요 없어지고(model-free), 비용이 상태 수와 무관해지고(차원의 저주 완화), 대신 분산이라는 새 문제를 얻는다. 표본으로 **예측**을 푸는 것이 [다음 글](/insight/rl-mc-td/)의 몬테카를로와 TD이고, 표본으로 **제어**를 푸는 것이 (6)의 SARSA와 Q-learning이다.
