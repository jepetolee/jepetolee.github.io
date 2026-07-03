---
title: "강화학습의 근간 (4): 몬테카를로와 TD — 그리고 둘을 잇는 TD(λ)"
date: 2026-07-03
draft: false
category: 개념 정리
series: 강화학습의 근간
tags: ["강화학습", "머신 러닝", "TD 학습", "몬테카를로", "TD-lambda"]
description: 모델 없이 경험만으로 가치를 추정하는 두 가지 길 — 에피소드 전체 수익으로 갱신하는 몬테카를로와 한 스텝 추정으로 갱신하는 TD — 를 편향-분산 관점에서 대비하고, n-step return과 λ-return(forward view)으로 둘 사이의 스펙트럼을 잇는다. TD(0)에서 시작해 backup이 종단 노드까지 확장되면 정확히 MC가 되는 수식(λ=1의 극한), 그리고 같은 것을 온라인으로 계산하는 eligibility trace(backward view)와 두 관점의 동치까지.
tldr:
  - MC는 실제 수익 G_t를 표적으로 쓴다 — 무편향이지만 분산이 크고 에피소드가 끝나야 배운다. TD(0)는 r + γV(s')를 표적으로 쓴다 — 매 스텝 배우지만 자기 추정으로 자기를 갱신(bootstrapping)하므로 편향이 있다.
  - n-step return은 실제 보상 n개 + 이후는 추정으로 자른 중간 지점이고, λ-return은 모든 n-step return의 기하 가중 평균이다. n→∞(종단까지 전개) 또는 λ=1에서 표적이 정확히 G_t가 되어 TD는 MC로 환원된다.
  - forward view(λ-return)는 미래를 기다려야 해서 온라인 계산이 안 된다. backward view는 eligibility trace로 같은 갱신을 매 스텝 과거로 흘려보내며, 오프라인 총갱신 기준으로 forward view와 동치다.
prerequisites:
  - MRP/MDP의 가치 함수와 벨만 방정식 ("[강화학습의 근간 (2)](/insight/rl-mdp/)")
  - DP의 backup 개념 ("[강화학습의 근간 (3)](/insight/rl-dynamic-programming/)")
---

## 모델을 빼앗긴 세계

[앞 글](/insight/rl-dynamic-programming/)의 결론: DP의 full-width backup에서 기댓값을 표본으로 바꾸면 model-free 강화학습이 된다. 이 글은 그 치환을 **예측 문제**(주어진 $\pi$의 $V^\pi$ 추정)에 대해 수행한다. 제어는 다음 글이다 — 예측을 먼저 완전히 이해해야 하는 이유는, model-free control이 결국 "이 글의 예측 방법 + greedy 개선"의 GPI이기 때문이다.

표본으로 기댓값을 추정하는 방법은 근본적으로 두 개뿐이고, 강화학습 전체가 이 두 축 위에 있다: **끝까지 가보고 평균내기(몬테카를로)** 와 **한 스텝 가보고 추정으로 잇기(TD)**.

## 몬테카를로 — 정의를 그대로 표본 평균으로

가치의 정의는 $V^\pi(s) = \mathbb{E}[G_t \mid S_t = s]$였다. 기댓값을 모르면? **표본 평균**을 쓰면 된다. 정책 $\pi$로 에피소드를 여러 번 굴리고, 상태 $s$를 방문한 시점마다 그 시점부터의 실제 수익 $G_t = R_{t+1} + \gamma R_{t+2} + \cdots + \gamma^{T-t-1} R_T$를 기록해 평균낸다. 이것이 **몬테카를로(MC) 예측**이다. 한 에피소드에서 같은 상태를 여러 번 방문했을 때 첫 방문만 세는 first-visit MC와 매번 세는 every-visit MC가 있는데, 둘 다 수렴하며 실용상 차이는 크지 않다.

평균은 점증적으로 쓸 수 있다 — 방문 횟수 $N(s)$를 세면서

$$V(S_t) \leftarrow V(S_t) + \frac{1}{N(S_t)} \big( G_t - V(S_t) \big)$$

비정상(non-stationary) 문제에서는 $1/N$ 대신 고정 스텝 크기 $\alpha$를 쓴다:

$$V(S_t) \leftarrow V(S_t) + \alpha \big( G_t - V(S_t) \big)$$

이 꼴 — **추정 ← 추정 + 스텝 크기 × (표적 − 추정)** — 은 이후 모든 알고리즘의 공통 골격이다. 알고리즘 간 차이는 오직 **표적(target)이 무엇인가**다. MC의 표적은 실제 수익 $G_t$: $V^\pi$의 정의 그대로이므로 **무편향**이지만, 수십~수백 스텝의 확률적 보상과 전이가 전부 합산된 값이라 **분산이 크다**. 그리고 치명적 제약 — $G_t$는 에피소드가 끝나야 알 수 있으므로, **끝나지 않는(continuing) 문제에는 아예 적용할 수 없고**, 긴 에피소드에서는 학습이 그만큼 늦다.

## TD(0) — 벨만 방정식을 표본으로

다른 길: 정의 대신 **벨만 방정식** $V^\pi(s) = \mathbb{E}[R_{t+1} + \gamma V^\pi(S_{t+1}) \mid S_t = s]$를 표본화한다. 한 스텝 겪은 것($R_{t+1}, S_{t+1}$)에 다음 상태의 **현재 추정** $V(S_{t+1})$을 이어붙인 것을 표적으로 쓰면:

$$V(S_t) \leftarrow V(S_t) + \alpha \big( \underbrace{R_{t+1} + \gamma V(S_{t+1})}_{\text{TD target}} - V(S_t) \big)$$

이것이 **TD(0)** 이고, 괄호 안 — $\delta_t = R_{t+1} + \gamma V(S_{t+1}) - V(S_t)$ — 이 **TD 오차**다. [1편](/insight/rl-origins/)에서 레스콜라-바그너의 예측 오차, 도파민 신호와 연결했던 바로 그 양이다(원 논문 리뷰는 [TD 학습](/papers/td-learning/) 참고).

TD의 본질은 **bootstrapping** — 추정($V(S_{t+1})$)으로 추정($V(S_t)$)을 갱신한다는 것이다. 대가로 표적이 **편향**된다($V(S_{t+1})$이 틀린 만큼 표적도 틀리다). 대신 얻는 것: 표적에 들어가는 확률량이 한 스텝치뿐이라 **분산이 훨씬 작고**, 에피소드가 끝나기를 기다릴 필요가 없어 **매 스텝 온라인으로, continuing 문제에서도** 배운다.

MC와 TD의 대비를 정리하면:

| | MC | TD(0) |
|---|---|---|
| 표적 | 실제 수익 $G_t$ | $R_{t+1} + \gamma V(S_{t+1})$ |
| 편향 | 없음 | 있음 (bootstrapping) |
| 분산 | 큼 | 작음 |
| 갱신 시점 | 에피소드 종료 후 | 매 스텝 |
| continuing 문제 | 불가 | 가능 |
| 함수 근사와 결합 | 안전한 편 | 발산 위험 (deadly triad의 한 축) |

깊은 차이도 하나 있다: 유한 데이터를 반복 학습시키면 MC는 관측 수익의 평균(경험적 평균)으로, TD는 **데이터로 암묵적 MDP 모델을 세웠을 때의 확실성 등가(certainty-equivalence) 해**로 수렴한다. TD는 마르코프 구조를 활용해 표본 사이의 정보를 엮고, MC는 각 에피소드를 독립 표본으로만 쓴다 — 환경이 실제로 마르코프에 가까울수록 TD가 유리한 이유다.

## n-step — 둘 사이를 잇는 다리

MC와 TD(0)는 극단이다: TD(0)는 실제 보상 1개 + 추정, MC는 실제 보상 전부 + 추정 없음. 그렇다면 중간 — 실제 보상 $n$개까지 가보고 자르는 — 이 당연히 존재한다. **n-step return**:

$$G_t^{(n)} = R_{t+1} + \gamma R_{t+2} + \cdots + \gamma^{n-1} R_{t+n} + \gamma^n V(S_{t+n})$$

$n = 1$이면 TD(0)의 표적이고, 여기서 핵심 관찰 — **$n$이 에피소드 끝까지 닿으면($t + n \ge T$) bootstrap할 다음 상태가 없으므로 $V(S_{t+n})$ 항이 사라지고, $G_t^{(n)} = G_t$, 즉 정확히 MC의 표적이 된다.** backup을 한 스텝씩 미래로 연장하다 종단 노드에 닿는 순간 TD는 MC로 환원된다 — MC와 TD는 서로 다른 방법이 아니라 **backup 깊이라는 하나의 축 위의 두 끝점**이다.

중간의 $n$은 실제로 양끝보다 나은 경우가 많다(편향과 분산을 나눠 갖는다). 문제는 최적 $n$이 문제마다, 심지어 학습 단계마다 다르다는 것 — 하나를 고르는 대신 전부 섞으면 어떨까?

## Forward view — λ-return

**TD(λ)의 forward view**는 모든 n-step return을 기하 가중치 $(1-\lambda)\lambda^{n-1}$로 평균낸다:

$$G_t^\lambda = (1 - \lambda) \sum_{n=1}^{\infty} \lambda^{n-1} G_t^{(n)}$$

$(1-\lambda) \sum \lambda^{n-1} = 1$이므로 올바른 가중 평균이고, 갱신은 $V(S_t) \leftarrow V(S_t) + \alpha (G_t^\lambda - V(S_t))$다. 에피소드가 $T$에서 끝나면 $n \ge T - t$인 모든 n-step return이 $G_t$와 같으므로 꼬리가 합쳐진다:

$$G_t^\lambda = (1 - \lambda) \sum_{n=1}^{T-t-1} \lambda^{n-1} G_t^{(n)} + \lambda^{T-t-1} G_t$$

양끝을 확인하자. $\lambda = 0$: 첫 항만 남아 $G_t^{(1)}$ — **TD(0)** 다(이름의 유래). $\lambda = 1$: 앞의 합이 통째로 사라지고 $G_t^\lambda = G_t$ — **MC**다. 즉 n-step에서 본 "종단까지 전개하면 MC"라는 사실이 λ라는 연속 손잡이로 다시 나타난다:

$$\text{TD}(0) \xleftarrow{\;\lambda = 0\;} \text{TD}(\lambda) \xrightarrow{\;\lambda = 1\;} \text{MC}$$

기하 가중을 쓰는 이유는 이론적 필연이 아니라 계산의 우아함이다 — 아래 backward view에서 메모리 하나로 구현되는 유일한 가중이 기하 감쇠다.

그런데 forward view에는 결정적 결함이 있다: $G_t^\lambda$는 미래의 n-step return 전부에 의존하므로 **에피소드가 끝나야 계산할 수 있다**. TD의 존재 이유였던 온라인 학습이 사라진 것이다. 이론(무엇을 향해 갱신하는가)으로는 forward view가 명확하지만, 구현은 다른 관점이 필요하다.

## Backward view — eligibility trace

발상을 뒤집는다: "지금 상태의 갱신을 위해 미래를 기다리는" 대신, **지금 발생한 TD 오차를 과거의 상태들에게 나눠준다.** 각 상태에 **eligibility trace(적격 흔적)** 를 붙인다:

$$E_t(s) = \gamma \lambda E_{t-1}(s) + \mathbf{1}(S_t = s)$$

— 방문하면 1이 더해지고, 매 스텝 $\gamma\lambda$배로 감쇠한다. 최근에, 자주 방문한 상태일수록 trace가 크다(빈도 + 최근성의 결합). 그리고 매 스텝, **모든 상태를** 현재 TD 오차와 trace의 곱으로 갱신한다:

$$V(s) \leftarrow V(s) + \alpha \, \delta_t \, E_t(s) \quad \forall s$$

이것이 **backward view TD(λ)** 다. 방금 좋은/나쁜 일이 벌어졌을 때($\delta_t$), 그 공과를 최근 지나온 상태들에 감쇠 가중으로 소급 배분하는 것 — [TD 학습 리뷰](/papers/td-learning/)에서 다룬 **신용 할당(credit assignment) 문제**에 대한 직접적인 답이다. $\lambda = 0$이면 trace가 현재 상태에만 남아 TD(0)와 일치하고, $\lambda = 1$이면 감쇠가 $\gamma$뿐이라 에피소드 내내 흔적이 남아 MC에 대응한다.

두 관점의 관계는 정리로 닫힌다: **에피소드 동안의 갱신을 모아뒀다 끝에 한 번에 적용(오프라인 갱신)하면, backward view의 총갱신은 forward view의 총갱신과 정확히 같다.** 온라인으로 매 스텝 적용하면 $V$가 도중에 변하므로 근사적으로만 같다(이 간극을 정확히 메운 것이 후대의 true online TD(λ)다). 실무 감각으로는 — forward view로 **이해하고**, backward view로 **구현한다**.

## 다음 글

이제 model-free **예측**의 도구가 갖춰졌다: MC, TD(0), 그리고 그 사이의 TD(λ). 예측을 제어로 격상하려면 한 가지 문제가 더 필요하다 — 해본 행동만 갱신되는 세계에서 **탐험**을 어떻게 보장할 것인가. [다음 글](/insight/rl-bandits-ucb/)에서 이 딜레마를 가장 순수한 형태로 격리한 Multi-Armed Bandit과 regret, UCB 이론을 먼저 다지고, [(6)](/insight/rl-model-free-control/)에서 그 어휘를 들고 제어로 간다 — ε-greedy와 GLIE-MC, SARSA, off-policy와 importance sampling, [Q-learning](/papers/q-learning/), DQN까지. 이 글의 λ 손잡이도 SARSA(λ)로 그대로 따라온다.
