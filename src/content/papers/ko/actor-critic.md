---
title: "Actor-Critic의 탄생: ASE와 ACE, 뉴런 둘로 cart-pole을 세우다"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "인공신경망", "Actor-Critic", "cart-pole", "신용 할당"]
paper: "Neuronlike Adaptive Elements That Can Solve Difficult Learning Control Problems"
paperUrl: "https://doi.org/10.1109/TSMC.1983.6313077"
authors: "Andrew G. Barto, Richard S. Sutton, Charles W. Anderson"
venue: "IEEE Transactions on Systems, Man, and Cybernetics"
year: 1983
references: []
description: 시행착오로 행동을 탐색하는 ASE(actor)와, 실패 신호만 주어지는 환경에서 더 촘촘한 내부 평가 신호를 스스로 만들어 ASE를 안내하는 ACE(critic)의 2요소 시스템을 제안한다. 운동 방정식을 모른 채 실패 신호만으로 cart-pole을 세우는 데 성공한, actor-critic 구조의 원전.
---

## 한 줄 요약

막대가 쓰러질 때만 실패 신호가 오는 cart-pole 문제 — 수백 스텝의 결정 중 무엇이 잘못이었는지 알 수 없는 **신용 할당(credit assignment)** 문제의 표본이다. 이 논문의 답이 오늘날 actor-critic이라 불리는 구조의 원형이다: 노이즈로 행동을 탐색하며 좋았던 행동을 강화하는 **ASE(actor)**와, 드문 실패 신호로부터 "매 순간의 형세 평가"를 스스로 학습해 ASE에게 촘촘한 내부 강화 신호를 공급하는 **ACE(critic)**. 정책 그래디언트 정리(1999)보다 16년 먼저, 공학적 직관으로 발명된 구조다.

## 핵심 기여

- **문제 설정의 급진성**: 카트-막대의 운동 방정식은 모른다고 가정하고, 피드백은 **실패 시의 신호 하나뿐**($r = -1$, 나머지는 0). Widrow식 지도학습(매 스텝 올바른 행동을 알려주는 오차 신호)과의 차이를 정면으로 논한다 — "오차 정정은 교사가 필요하고, 강화학습은 **평가자(critic)**만 있으면 된다." 지도학습과 강화학습의 구분이 이 논문에서 개념적으로 정리된다.

- **ASE (Associative Search Element) — actor**: 상태(162개 박스로 이산화된 4차원 상태의 one-hot)를 받아 $y(t) = f[\sum_i w_i x_i + \text{noise}]$로 행동(좌/우)을 낸다 — 노이즈가 탐험을, 가중치가 활용을 담당하는 확률적 정책이다. 학습은

$$w_i(t+1) = w_i(t) + \alpha\, r(t)\, e_i(t)$$

  — 보상과 **적격 흔적(eligibility trace)** $e_i$(입력과 출력이 함께 활성이던 기억의 감쇠 흔적)의 곱. "과거에 그 상태에서 그 행동을 했던 것"에 지연된 보상의 공을 배분하는, 시간적 신용 할당의 최초의 실용 장치다.

- **ACE (Adaptive Critic Element) — critic**: 상태별 예측 $p(t)$를 학습해, 외부 보상 대신 **내부 강화 신호**

$$\hat{r}(t) = r(t) + \gamma\, p(t) - p(t-1)$$

  를 ASE에 공급한다 — 5년 뒤 [TD 학습](/papers/td-learning/)으로 형식화될 TD 오차 그 자체다. 실패라는 드문 신호가 "형세가 나빠지고 있다/좋아지고 있다"는 **매 스텝의 신호**로 바뀌면서 신용 할당이 극적으로 쉬워진다. Samuel의 체커 프로그램(자기 평가 함수의 부트스트래핑)을 명시적 선조로 인용한다.

- **Boxes와의 비교 실험**: Michie & Chambers의 boxes 알고리즘(1968, 박스별 통계 저장)과 같은 이산화·같은 조건에서 비교 — ASE 단독으로 boxes와 대등, **ASE+ACE는 훨씬 빠르고 안정적으로** 오래 버티는 제어를 학습한다. critic의 가치가 실험으로 분리 증명된 것.

- **심리학·신경과학과의 접속**: ACE의 동작이 고전적 조건화(예측 학습)와, ASE가 도구적 조건화(시행착오)와 나란히 감을 명시적으로 논한다 — [강화학습의 두 뿌리](/insight/rl-origins/)가 한 시스템의 두 부품으로 구현된 구도다.

## 계보에서의 위치

이 논문의 어휘가 그대로 분야의 어휘가 됐다 — actor(ASE), critic(ACE), eligibility trace, 내부 강화 신호(= TD 오차). Sutton의 [TD 학습](/papers/td-learning/)(1988)이 ACE의 원리를 예측 문제의 일반 이론으로 승격시키고, [Q-learning](/papers/q-learning/)이 가치 갈래를, [REINFORCE](/papers/reinforce/)가 정책 갈래를 각각 형식화한 뒤, 두 갈래가 다시 합쳐진 현대 actor-critic([A3C](/papers/a3c/), [PPO](/papers/ppo/), [SAC](/papers/sac/))은 전부 이 1983년 구조의 정련이다 — critic의 TD 오차가 actor의 갱신을 안내한다는 뼈대는 42년째 그대로다. cart-pole이 지금도 강화학습의 "Hello, World"인 것 역시 이 논문의 유산이다.
