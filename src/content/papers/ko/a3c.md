---
title: "A3C: replay buffer 대신 병렬 — advantage actor-critic의 부활"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "ICML", "Google DeepMind", "A3C", "A2C", "Actor-Critic", "Atari"]
paper: "Asynchronous Methods for Deep Reinforcement Learning"
paperUrl: "https://arxiv.org/abs/1602.01783"
authors: "Volodymyr Mnih, Adrià Puigdomènech Badia, Mehdi Mirza, Alex Graves, Timothy P. Lillicrap, Tim Harley, David Silver, Koray Kavukcuoglu"
venue: "ICML"
year: 2016
references: ["actor-critic", "q-learning", "reinforce", "lstm"]
description: DQN의 안정화 장치였던 experience replay를 병렬 비동기 actor들로 대체한다 — 서로 다른 환경 인스턴스를 도는 16개 스레드가 데이터의 상관을 자연히 깨므로, on-policy 방법도 심층망 위에서 안정적으로 학습된다. 그 대표인 A3C(n-step advantage actor-critic + 엔트로피 정규화)는 GPU 없이 CPU 4일 만에 Atari SOTA를 절반의 시간으로 경신했다.
---

## 한 줄 요약

DQN이 심층망 + RL의 불안정을 replay buffer로 눌렀다면, 이 논문의 처방은 **병렬성**이다 — 서로 다른 환경 인스턴스를 도는 비동기 actor 16개가 매 순간 서로 다른 상태를 겪으므로, 갱신에 쓰이는 데이터의 상관이 자연히 깨진다. replay가 필요 없으니 **on-policy 방법이 해금**되고, 메모리도 GPU도 필요 없다. 그렇게 부활한 [advantage actor-critic](/papers/actor-critic/)이 **A3C** — CPU 16코어 4일로 Atari SOTA를 절반의 학습 시간에 경신했고, 그 동기(synchronous) 버전 **A2C**와 함께 이후 on-policy deep RL의 기본형이 됐다.

## 핵심 기여

- **비동기 프레임 자체가 기여다**: one-step Q, one-step SARSA, n-step Q, actor-critic 네 가지를 모두 비동기 병렬화해 — 스레드마다 그래디언트를 누적하고 Hogwild!식 무잠금 공유 파라미터에 적용 — **replay 없이 전부 안정 학습**됨을 보였다. off-policy 제약이 사라지자 SARSA·actor-critic 같은 on-policy 방법이 심층망 위에서 처음으로 실용이 됐다. 덤으로 발견된 현상: Q-learning 계열은 스레드를 늘리면 **초선형 가속**(16스레드에서 24.1배) — 병렬 탐험이 편향을 줄여 스레드당 필요 표본까지 줄어든다.

- **A3C의 구성**: 정책 $\pi(a|s;\theta)$와 가치 $V(s;\theta_v)$가 conv 몸통을 공유하는 두 head. $t_{max} = 5$스텝의 n-step 수익으로 advantage를 만들고,

$$A(s_t) = \sum_{i=0}^{k-1} \gamma^i r_{t+i} + \gamma^k V(s_{t+k}) - V(s_t)$$

$$\nabla_{\theta} \log \pi(a_t \mid s_t)\, A(s_t) + \beta\, \nabla_{\theta} H(\pi(\cdot \mid s_t))$$

  로 갱신한다 — [REINFORCE](/papers/reinforce/)의 baseline 자리에 학습된 $V$(critic)가 들어간 형태이고, **엔트로피 보너스** $\beta H$($\beta = 0.01$)가 조기 결정론화를 막는 탐험 장치다(이 항이 이후 SAC의 최대 엔트로피 목적의 전조다). 스레드 간 공유 통계의 RMSProp이 개별 통계보다 확연히 강건했고, LSTM을 붙인 순환 변형도 제시된다.

- **A2C — 비동기는 본질이 아니었다**: 이후 커뮤니티(OpenAI baselines)가 확인한 것: 비동기성 자체가 아니라 **병렬 환경에 의한 탈상관**이 핵심이라, 모든 actor를 동기식으로 모아 배치 갱신하는 A2C가 같은 성능에 GPU 활용은 더 좋다. 오늘날 구현 대부분이 A2C 쪽이며, 이 논문은 두 이름의 공통 원전이다.

## 주요 결과

- **Atari 57종** (인간 정규화 점수): A3C FF 4일 CPU — 평균 496.8% / 중앙값 116.6%, A3C LSTM — 평균 **623.0%**. GPU 8일+의 Dueling Double DQN(343.8%/117.1%), Prioritized DQN(463.6%/127.6%) 대비 **절반의 시간으로 평균 SOTA**.
- 범용성: TORCS 레이싱(~12시간에 인간의 75~90%), MuJoCo 연속 제어(연속 행동 정책으로 24시간 내 대부분 해결 — actor-critic이라 이산/연속을 가리지 않는다), 3D 미로 Labyrinth(LSTM)까지.
- 강건성: 학습률·초기화 50조합 실험에서 넓은 학습률 구간 전체가 안정적으로 학습 — "운 좋은 시드"에 기대지 않는다는 증거.

## 계보에서의 위치

[1983년의 actor-critic](/papers/actor-critic/)이 심층 시대에 실용 알고리즘으로 부활한 지점이다 — critic의 TD 오차 대신 n-step advantage, 이산화된 상태 대신 conv 인코더, 그리고 안정화는 replay 대신 병렬. 이 구도가 곧바로 두 방향으로 정련된다: 갱신 보폭의 통제(TRPO → [PPO](/papers/ppo/) — 실제로 PPO 논문의 베이스라인이자 출발점이 A2C다)와, off-policy로의 회귀 + 엔트로피 목적의 승격([SAC](/papers/sac/)). 시스템 관점으로는 "환경 병렬화가 deep RL의 기본 인프라"라는 상식을 만든 논문 — IMPALA류 대규모 분산 RL과 오늘날 RLHF 학습 시스템의 rollout worker 구조까지, 이 논문이 그린 그림 위에 있다.
