---
title: "DQN: 픽셀에서 Q*까지 — deep RL을 성립시킨 두 개의 부품"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Value Methods
tags: ["강화학습", "Google DeepMind", "DQN", "Q-learning", "Atari", "off-policy"]
paper: "Human-level control through deep reinforcement learning"
paperUrl: "https://doi.org/10.1038/nature14236"
authors: "Volodymyr Mnih, Koray Kavukcuoglu, David Silver, et al."
venue: "Nature"
year: 2015
references: ["q-learning", "alexnet"]
description: Q-learning을 CNN 함수 근사와 결합할 때 발생하는 불안정(상관된 표본, 움직이는 표적)을 experience replay와 target network라는 두 부품으로 눌러, 하나의 네트워크·하나의 하이퍼파라미터 세트로 49개 Atari 게임을 픽셀 입력만으로 학습시킨 논문. 함수 근사 하의 Q-learning이 처음으로 대규모에서 안정적으로 작동함을 보여 deep RL 시대를 연 기점.
---

## 한 줄 요약

[Q-learning](/papers/q-learning/)의 수렴 증명은 lookup table에 한정된다는 단서가 붙어 있었고, 신경망 근사와 결합하면 실제로 발산하기 일쑤였다(함수 근사 + bootstrapping + off-policy의 **deadly triad**). 이 논문은 발산의 두 기전 — 연속 표본의 강한 상관, 그리고 갱신할 파라미터가 표적 안에도 들어 있어 표적이 학습을 따라 움직이는 문제 — 에 부품을 하나씩 대응시킨다: **experience replay**(상관 제거 + 데이터 재사용)와 **target network**(표적 고정). 그 결과가 "픽셀과 점수만 주면 게임을 배우는" 단일 에이전트다.

## 핵심 기여

- **문제 설정 — 진짜 end-to-end**: 입력은 $84 \times 84$ 그레이스케일 프레임 4장 스택(한 장으로는 속도가 안 보인다 — 관측을 마르코프 상태로 만드는 최소 장치. [상태와 부분 관측 논의](/insight/rl-mdp/) 참고), 출력은 행동별 $Q(s, a; \theta)$를 한 번에 내는 CNN([AlexNet](/papers/alexnet/) 시대의 3 conv + 2 FC). 게임별 특징 공학 없이 49개 게임에 같은 구조·같은 하이퍼파라미터를 쓴다.

- **Experience replay**: 전이 $(s, a, r, s')$를 링 버퍼(100만 개)에 쌓고 매 스텝 무작위 미니배치로 학습한다. 효과가 셋 — (1) 연속 프레임의 상관을 깨서 SGD의 i.i.d. 가정에 가깝게 만들고, (2) 경험 하나가 여러 번 재사용되어 표본 효율이 오르고, (3) 현재 정책이 데이터 분포를 즉각 지배하는 피드백 루프(진동·발산의 원인)를 완화한다. **Q-learning이 off-policy라서 가능한 설계**라는 점이 요체다 — 버퍼 속 데이터는 과거 정책들의 것이므로, on-policy 알고리즘은 이 버퍼를 쓸 수 없다([on/off-policy 구분](/insight/rl-model-free-control/)).

- **Target network**: 표적 계산용 파라미터 $\theta^-$를 복제해 두고 $C$ 스텝(1만)마다만 동기화한다. 손실은

$$\mathcal{L}(\theta) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}} \Big[ \big( r + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta) \big)^2 \Big]$$

  — 움직이던 표적을 한동안 못박아, 매 구간을 보통의 회귀 문제로 만든다. Nature판 ablation이 두 부품의 기여를 정량화한다: replay와 target network를 둘 다 빼면 점수가 문자 그대로 무너지고, 각각 하나만으로도 크게 부족하다 — "둘 다"가 성립 조건이다.

- **자잘하지만 중요한 안정화**: 보상을 $[-1, 1]$로 클리핑해 게임 간 스케일을 통일하고(하나의 학습률이 전 게임에서 작동하는 이유), TD 오차도 클리핑한다(Huber 손실과 등가). 탐험은 ε-greedy(1.0 → 0.1 어닐링) — [탐험의 최소 해법](/insight/rl-model-free-control/)이 이 스케일에서도 그대로 쓰인다.

- **결과**: 49개 게임 중 다수에서 기존 방법을 큰 차이로 넘고, 절반 이상에서 인간 테스터의 75% 이상 성능("human-level"의 조작적 정의). Breakout에서 터널 파기 같은 전략의 창발이 상징적 장면이 됐다. 반면 장기 계획이 필요한 게임(Montezuma's Revenge)에서는 거의 0점 — ε-greedy 탐험의 한계가 그대로 노출되며, 이후 탐험 연구의 표준 벤치마크가 된다.

## 계보에서의 위치

[Q-learning](/papers/q-learning/)(1992)이 남긴 두 경고 — $\max$의 과대추정, 함수 근사에서의 불안정 — 중 후자를 공학으로 눌러낸 논문이고, 가치 갈래가 심층 학습 시대에 살아남게 한 기점이다([model-free control 글](/insight/rl-model-free-control/)의 종착점). 직계 후속이 정확히 남은 문제들을 하나씩 처리한다: 과대추정 편향을 행동 선택/평가 분리로 고친 Double DQN, 균등 재생을 TD 오차 비례로 바꾼 prioritized replay, $V$와 advantage를 분리한 dueling, 그리고 이들의 총합인 Rainbow. 한편 이 논문이 성립시킨 "replay buffer + off-policy" 패턴은 연속 제어의 DDPG와 [SAC](/papers/sac/)로 이식됐고, 반대편에서 replay 없이 병렬성으로 승부한 [A3C](/papers/a3c/)와의 대비가 이후 on/off-policy 진영 구도를 만들었다.
