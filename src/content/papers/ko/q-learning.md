---
title: "Q-learning: 모델 없이, 정책과 무관하게, 최적 행동 가치로"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: Value Methods
tags: ["강화학습", "머신 러닝", "Q-learning", "off-policy", "동적 계획법"]
paper: "Q-learning (Technical Note)"
paperUrl: "https://doi.org/10.1007/BF00992698"
authors: "Christopher J.C.H. Watkins, Peter Dayan"
venue: "Machine Learning"
year: 1992
references: ["td-learning"]
description: 상태-행동 가치 Q(s,a)를 경험된 전이 하나와 다음 상태의 max Q로 갱신하는 Q-learning이, 모든 상태-행동을 무한히 방문하고 학습률이 Robbins-Monro 조건을 만족하면 확률 1로 최적 Q*에 수렴함을 증명한다. 행동을 어떻게 골랐든 최적 정책의 가치를 배우는 off-policy 학습의 기초 정리.
---

## 한 줄 요약

Watkins의 1989년 학위논문이 제안한 Q-learning — 모델 없는 점증적 동적 계획법 — 의 **수렴 증명**을 완성한 technical note다. 핵심 성질이 알고리즘의 정체성이다: 갱신에 실제로 한 행동이 아니라 $\max_b Q(y, b)$가 들어가므로, **어떤 정책으로 탐험하든**(예: ε-greedy) 배우는 것은 **최적 정책의 가치**다. 이 off-policy 성질이 이후 replay buffer와 DQN을 가능케 하는 가치 갈래의 초석이고, 이 논문은 그것이 수학적으로 안전함을 보증했다.

## 핵심 기여

- **행동 가치의 재귀**: 상태 가치 $V$만으로는 모델 없이 greedy 행동을 고를 수 없다(어느 행동이 어느 상태로 가는지 몰라서). 행동까지 조건화한 $Q^\pi(x, a) = \mathcal{R}_x(a) + \gamma \sum_y P_{xy}[a] V^\pi(y)$를 도입하면 $V^*(x) = \max_a Q^*(x, a)$이고 **최적 정책이 $\arg\max_a Q^*$로 즉시 나온다** — 모델도 계획도 없이. "$Q$만 배우면 끝"이라는 이 재정식화가 가치 기반 강화학습의 문제 정의다.

- **갱신 규칙**: 경험 $(x_n, a_n, y_n, r_n)$마다

$$Q_n(x, a) = (1 - \alpha_n) Q_{n-1}(x, a) + \alpha_n \left[ r_n + \gamma \max_b Q_{n-1}(y_n, b) \right]$$

  (해당 $(x_n, a_n)$만 갱신). [TD 학습](/papers/td-learning/)의 시간차 원리를 행동 가치 + $\max$ 연산에 적용한 것 — 그리고 그 $\max$가 on-policy(SARSA)와의 결정적 차이다: 탐험 행동의 결과로 갱신하지 않고 항상 "최선을 택했다면"으로 갱신하므로, 행동 정책과 학습 대상 정책이 분리된다.

- **수렴 정리**: 보상이 유계이고, 학습률이 $0 \le \alpha_n < 1$이며 모든 $(x, a)$에 대해

$$\sum_i \alpha_{n^i(x,a)} = \infty, \qquad \sum_i \left[\alpha_{n^i(x,a)}\right]^2 < \infty$$

  (Robbins-Monro 조건 — 무한히 배우되 점점 조심스럽게)이면, **$Q_n \to Q^*$ 확률 1 수렴**. 조건 "모든 상태-행동의 무한 방문"이 곧 ε-greedy 같은 지속적 탐험의 이론적 근거다. 단서도 명시된다 — 증명은 **lookup table 표현에 한정**되며, 함수 근사에서는 수렴이 보장되지 않는다(deadly triad 문제의 예고).

- **증명 장치 — Action-Replay Process**: 에피소드들을 카드 덱으로 쌓고 학습률을 편향 동전으로 쓰는 인공 마르코프 과정(ARP)을 구성해, (A) $Q_n$이 ARP의 최적 가치와 정확히 일치하고 (B) ARP가 실제 과정으로 수렴함을 보이는 2단 구성 — 경험의 "재생(replay)"이라는 은유가 증명 기법으로 등장하는 것이 흥미롭다. 비할인($\gamma=1$) 흡수 과정과 다중 갱신으로의 확장도 스케치한다.

## 계보에서의 위치

가치 갈래([Value/Policy 지도](/insight/rl-value-policy-map/))의 척추다. [TD 학습](/papers/td-learning/)이 예측을, Q-learning이 제어를 맡으면서 "모델 없는 강화학습"의 기본형이 완성됐고, off-policy 성질은 20여 년 뒤 DQN(2013/15)에서 진가를 발휘한다 — replay buffer로 과거 경험을 재사용할 수 있는 것이 정확히 이 성질 덕이며, DQN의 타깃 네트워크와 double Q-learning은 이 논문이 남긴 두 경고($\max$의 과대추정 편향, 함수 근사에서의 불안정)에 대한 처방이다. [Dyna-Q](/papers/dyna-q/)는 이 갱신을 상상된 경험에도 적용해 model-based로 확장했고, [SAC](/papers/sac/)의 soft Q-function까지 — $Q$라는 글자가 붙은 모든 것이 여기서 나왔다.
