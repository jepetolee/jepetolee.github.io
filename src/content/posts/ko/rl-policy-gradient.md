---
title: "강화학습의 근간 (7): Policy Gradient — REINFORCE에서 자연 그래디언트, TRPO, PPO까지"
date: 2026-07-03
draft: false
category: 개념 정리
series: 강화학습의 근간
tags: ["강화학습", "머신 러닝", "Policy Gradient", "TRPO", "PPO", "Fisher Information"]
description: 가치를 거치지 않고 정책을 직접 최적화하는 갈래를 수식의 계보로 따라간다 — policy gradient 정리와 REINFORCE, baseline과 advantage로 분산을 깎는 과정, "파라미터 공간의 거리 ≠ 정책 공간의 거리"라는 문제의식에서 나온 natural policy gradient와 Fisher 정보 행렬(KL의 2차 근사), 그것을 제약 최적화로 실용화한 TRPO, 그리고 2차 계산을 클리핑 하나로 대체해 표준이 된 PPO까지.
tldr:
  - Policy gradient 정리 — ∇J = E[∇log π(a|s) · Q^π(s,a)] — 는 환경의 미분(전이 확률의 그래디언트) 없이 정책 그래디언트를 표본으로 추정할 수 있게 한다. Q^π 자리에 실제 수익 G_t를 넣으면 REINFORCE다.
  - "분산 축소의 열쇠는 baseline: 상태만의 함수 b(s)를 빼도 기댓값이 불변임이 증명되고, b(s)=V(s)로 두면 advantage A=Q−V가 된다. V를 배우는 순간 actor-critic이다."
  - 같은 크기의 파라미터 갱신이 정책을 조금 바꿀 수도, 파괴할 수도 있다. Natural gradient는 KL 발산(2차 근사가 Fisher 행렬)으로 잰 정책 공간의 거리로 보폭을 재정의한 F⁻¹∇J이며, 파라미터화에 불변이다.
  - TRPO는 "옛 정책 데이터로 새 정책을 평가하는 IS surrogate를 KL ≤ δ 제약 하에 최대화"로 이를 실용화했고, PPO는 그 제약을 확률비 클리핑으로 대체해 1차 최적화만으로 같은 효과를 내 사실상의 표준이 됐다 — RLHF의 InstructGPT까지.
prerequisites:
  - 가치 기반 control과 importance sampling ("[강화학습의 근간 (6)](/insight/rl-model-free-control/)")
  - 로그 미분, 테일러 전개, KL 발산에 대한 기본 감각
---

## 왜 정책을 직접 미는가

[앞 글](/insight/rl-model-free-control/)의 가치 기반 갈래는 $Q$를 배우고 정책을 $\arg\max$로 유도했다. 그 $\arg\max$가 세 군데서 부러진다: **연속 행동**(로봇 관절 토크 — 매 스텝 $\max_a$가 그 자체로 최적화 문제다), **확률적 최적 정책**(가위바위보처럼 섞는 것이 최적인 문제 — greedy는 표현 불가), **불안정성**($Q$ 추정이 조금 바뀌면 $\arg\max$가 불연속적으로 튄다). 그래서 반대 접근 — 정책 자체를 $\pi_\theta(a \mid s)$로 파라미터화하고, 목적 함수

$$J(\theta) = \mathbb{E}_{\pi_\theta}[G_0] \quad (\text{시작 상태에서의 기대 수익})$$

의 그래디언트를 **직접** 올라간다. 이 갈래의 역사는 하나의 수식($\nabla J$)을 얻는 이야기와, 그 추정의 **분산**과 갱신의 **보폭**이라는 두 문제를 30년에 걸쳐 고치는 이야기다.

## Policy Gradient 정리 — 환경을 미분하지 않아도 된다

$J(\theta)$는 정책뿐 아니라 환경(전이 분포)에도 의존하는데, 환경은 미분할 수 없다(모델이 없으니까). 놀랍게도 그래디언트에서 환경의 미분이 사라진다는 것이 **policy gradient 정리**다. 핵심 트릭은 로그 미분(likelihood ratio):

$$\nabla_\theta \pi_\theta(a \mid s) = \pi_\theta(a \mid s) \, \nabla_\theta \log \pi_\theta(a \mid s)$$

궤적 $\tau$의 확률은 $p_\theta(\tau) = p(s_0) \prod_t \pi_\theta(a_t \mid s_t) \, p(s_{t+1} \mid s_t, a_t)$인데, 로그를 취하면 곱이 합이 되고 **전이 항은 $\theta$와 무관해 미분에서 통째로 떨어진다**. 정리하면:

$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta} \big[ \nabla_\theta \log \pi_\theta(a \mid s) \; Q^{\pi_\theta}(s, a) \big]$$

읽는 법: $\nabla \log \pi(a|s)$는 "이 행동의 확률을 높이는 파라미터 방향"이고, $Q^\pi(s,a)$는 그 방향으로 **얼마나** 갈지의 가중치다. **좋았던 행동은 더 자주 하도록, 나빴던 행동은 덜 하도록** — [1편](/insight/rl-origins/)의 손다이크 효과의 법칙이 그래디언트로 번역된 것이다. 그리고 우변이 $\pi_\theta$ 하의 기댓값이므로 **자기 궤적의 표본 평균으로 추정 가능** — 본질적으로 on-policy다.

## REINFORCE — 그리고 분산과의 전쟁

$Q^\pi$를 모르니 무편향 표본으로 대체하자 — 실제 수익 $G_t$($Q^\pi$의 정의 그대로 무편향 추정치다):

$$\theta \leftarrow \theta + \alpha \, \gamma^t \, G_t \, \nabla_\theta \log \pi_\theta(A_t \mid S_t)$$

이것이 **[REINFORCE](/papers/reinforce/)**(Williams, 1992)다. 무편향이지만 분산이 크다 — $G_t$는 에피소드 하나의 확률적 보상 수십 개의 합이고, 그것이 그래디언트에 통째로 곱해진다. [(4)의 MC vs TD](/insight/rl-mc-td/)에서 본 "MC 표적의 고분산" 문제가 정책 갈래에서 그대로 재현되는 것이다.

첫 번째 무기가 **baseline**이다. 상태만의 함수 $b(s)$를 빼도 기댓값이 변하지 않는다:

$$\mathbb{E}_{\pi_\theta}\big[ \nabla_\theta \log \pi_\theta(a \mid s) \, b(s) \big] = \sum_a \pi_\theta(a|s) \nabla_\theta \log \pi_\theta(a|s)\, b(s) = b(s) \nabla_\theta \underbrace{\sum_a \pi_\theta(a \mid s)}_{=\,1} = 0$$

— 확률의 합은 항상 1이므로 그 그래디언트는 0. **편향은 그대로 0, 분산만 줄일 수 있는** 공짜 자유도다. 최선의 선택은 $b(s) = V^\pi(s)$이고, 그러면 가중치가

$$A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$$

— **advantage**, "이 행동이 그 상태의 평균보다 얼마나 나은가"가 된다. 절대 수익이 아니라 상대 우열만 남으니 스케일이 작고 분산이 준다. 그런데 $V^\pi$를 어디서 얻나? **배워야 한다** — 가치 추정기(critic)를 두고 그 TD 오차로 advantage를 근사하는 순간($\delta_t = r + \gamma V(s') - V(s)$는 $A^\pi$의 무편향 추정치다), 정책 갈래는 가치 갈래를 도로 불러들인 것이고, 그 구조가 [actor-critic](/papers/actor-critic/)이다. 이 합류의 지도는 [별도 글](/insight/rl-value-policy-map/)에서 다루므로, 여기서는 정책 갈래 고유의 두 번째 문제 — **보폭** — 로 직진한다.

## 보폭 문제 — 파라미터의 거리는 정책의 거리가 아니다

경사 상승 $\theta \leftarrow \theta + \alpha \nabla J$의 암묵적 가정: "$\theta$를 조금 바꾸면 정책도 조금 바뀐다." 거짓이다. 같은 $\lVert \Delta\theta \rVert$라도 어떤 방향은 정책 분포를 거의 안 바꾸고, 어떤 방향은 파괴한다(예: 가우시안 정책의 $\sigma$가 작을 때 평균 $\mu$의 미세 변화는 분포를 격변시킨다). 더구나 지도학습과 달리 강화학습에서 한 번의 과격한 갱신은 **나쁜 정책 → 나쁜 데이터 → 더 나쁜 갱신**의 자기 파괴 루프를 만든다 — 데이터를 정책 자신이 수집하기 때문이다.

올바른 질문은 "파라미터 공간에서 얼마나 움직일까"가 아니라 "**분포 공간에서** 얼마나 움직일까"다. 분포 사이의 거리는 KL 발산으로 재고, KL을 $\theta$ 근방에서 테일러 전개하면(1차 항은 0이다):

$$D_{\mathrm{KL}}\big( \pi_\theta \,\Vert\, \pi_{\theta + \Delta\theta} \big) \approx \tfrac{1}{2} \Delta\theta^\top F(\theta) \, \Delta\theta$$

여기의 $F$가 **Fisher 정보 행렬**:

$$F(\theta) = \mathbb{E}_{s, a \sim \pi_\theta} \big[ \nabla_\theta \log \pi_\theta(a \mid s) \, \nabla_\theta \log \pi_\theta(a \mid s)^\top \big]$$

— **분포 공간의 국소 거리(리만 계량)를 파라미터 좌표로 표현한 것**이다. 파라미터를 어떻게 좌표 잡았든 분포 자체의 기하는 이 계량으로 일관되게 측정된다.

## Natural Policy Gradient — 올바른 계량에서의 최급상승

"KL로 잰 반경 안에서 $J$를 가장 올리는 방향"을 구하면 — $\max_{\Delta\theta} \nabla J^\top \Delta\theta$ s.t. $\tfrac12 \Delta\theta^\top F \Delta\theta \le \epsilon$ — 라그랑주로 즉시:

$$\Delta\theta \propto F^{-1} \nabla_\theta J$$

이것이 **[natural policy gradient](/papers/natural-policy-gradient/)**(Kakade, 2001; 원류는 Amari의 정보기하학)다. 일반 그래디언트를 Fisher 행렬로 "휘어진 좌표 보정"한 것으로, 결정적 장점은 **파라미터화 불변** — 같은 정책 분포를 어떤 좌표로 표현했든 natural gradient가 가리키는 분포 공간의 방향은 같다. 민감한 파라미터 방향(작은 변화가 분포를 크게 바꾸는)은 자동으로 보폭이 줄고, 둔감한 방향은 늘어난다.

문제는 계산이다: $F$는 파라미터 수 $n$에 대해 $n \times n$ — 신경망이면 역행렬은커녕 저장도 불가능하다. 이 실용화가 다음 단계다.

## TRPO — 신뢰 영역으로 실용화

**[TRPO](/papers/trpo/)**(Trust Region Policy Optimization, Schulman et al. 2015)는 natural gradient의 발상을 제약 최적화로 다시 쓴다. 먼저 목적: 새 정책 $\pi_\theta$를 평가하고 싶은데 데이터는 옛 정책 $\pi_{\theta_{\text{old}}}$가 만든 것 — [(6)에서 챙겨둔 importance sampling](/insight/rl-model-free-control/)이 여기서 재등장한다. 확률비 $r_t(\theta) = \dfrac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}$로 보정한 **surrogate objective**:

$$\max_\theta \; \mathbb{E}_{t} \big[ r_t(\theta) \, \hat{A}_t \big] \qquad \text{s.t.} \quad \mathbb{E}_t \big[ D_{\mathrm{KL}}\big( \pi_{\theta_{\text{old}}}(\cdot \mid s_t) \,\Vert\, \pi_\theta(\cdot \mid s_t) \big) \big] \le \delta$$

이론적 근거가 단단하다 — surrogate는 $\theta = \theta_{\text{old}}$ 근방에서 $J$와 1차까지 일치하고, TRPO 논문은 **KL 신뢰 영역 안에서 surrogate를 개선하면 진짜 $J$의 단조 개선이 (완화된 형태로) 보장됨**을 보인다. [(3)의 정책 개선 정리](/insight/rl-dynamic-programming/)의 근사 버전인 셈이다. 계산은 $F^{-1}\nabla J$를 명시적 역행렬 없이 **켤레 그래디언트**(Fisher-벡터 곱만 필요)로 풀고 라인 서치로 제약을 확인한다.

TRPO는 강력했지만 무겁다 — 2차 계산, 켤레 그래디언트, 라인 서치. Adam으로 한 줄이면 되는 지도학습 감각과 너무 멀었다.

## PPO — 클리핑 하나로 같은 효과를

**[PPO](/papers/ppo/)**(2017)의 질문: 신뢰 영역의 **효과**(과격한 갱신 방지)를 1차 최적화만으로 얻을 수 없나? 답은 surrogate 자체를 수술하는 것 — 확률비가 $[1-\epsilon, 1+\epsilon]$을 벗어나면 목적 함수를 잘라 그 방향의 인센티브를 없앤다:

$$\mathcal{L}^{\text{CLIP}}(\theta) = \mathbb{E}_t \Big[ \min\!\big( r_t(\theta) \, \hat{A}_t, \;\; \mathrm{clip}(r_t(\theta),\, 1 - \epsilon,\, 1 + \epsilon) \, \hat{A}_t \big) \Big]$$

동작을 뜯어보면: $\hat A_t > 0$(좋았던 행동)일 때 $r_t$가 $1+\epsilon$을 넘으면 목적이 상수가 되어 **더 밀어올릴 그래디언트가 사라진다** — "좋은 행동도 확률을 한 번에 $\epsilon$ 이상 키우지 마라". $\hat A_t < 0$이면 반대쪽이 잘린다. 바깥의 $\min$은 클리핑이 항상 **비관적**(하한) 방향으로 작동하게 해, 이미 과하게 움직인 경우 되돌리는 그래디언트는 살려둔다. 결과: 같은 데이터로 여러 에폭 갱신해도 정책이 신뢰 영역 근방을 벗어나지 않고, 구현은 클리핑 한 줄 + Adam이다.

이 "이론은 TRPO에서, 실무는 클리핑으로"의 균형이 PPO를 on-policy의 사실상 표준으로 만들었다 — 로보틱스와 게임을 지나 [InstructGPT](/papers/instructgpt/)의 RLHF까지, LLM 정렬의 기본 최적화기가 된 것도 이 견고함 덕이다. advantage 추정 쪽의 짝인 GAE(generalized advantage estimation)가 [(4)의 λ-return](/insight/rl-mc-td/)을 advantage에 적용한 것이라는 점도 짚어두자 — $\hat A_t^{\mathrm{GAE}(\gamma,\lambda)} = \sum_{l} (\gamma\lambda)^l \delta_{t+l}$, TD(λ)의 손잡이가 여기서도 편향-분산을 조절한다.

계보를 한 줄로 접으면:

$$\text{REINFORCE} \xrightarrow{\text{baseline/advantage}} \text{actor-critic} \xrightarrow{\;F^{-1}\nabla J\;} \text{NPG} \xrightarrow{\text{IS surrogate + KL 제약}} \text{TRPO} \xrightarrow{\text{클리핑}} \text{PPO}$$

— 분산을 깎는 전반부와 보폭을 다스리는 후반부, 정확히 두 문제에 대한 다섯 개의 답이다.

## 다음 글

가치 갈래(6)와 정책 갈래(7)는 모두 **model-free** — 환경 모델 없이 경험만으로 배웠다. [다음 글](/insight/rl-planning-mcts/)은 마지막 축을 채운다: 경험으로 **모델을 배우고 그 모델로 계획**하는 model-based 강화학습 — [Dyna-Q](/papers/dyna-q/)의 통합 아키텍처, 결정 시점 계획으로서의 MCTS, 그리고 그 모두가 합쳐진 알파고의 설계까지.
