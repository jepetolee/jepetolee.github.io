---
title: "Deep RL from Human Preferences: 보상 함수를 사람의 선호에서 배우다"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: RLHF & Alignment
tags: ["강화학습", "NeurIPS", "OpenAI", "Google DeepMind", "RLHF", "보상 모델"]
paper: "Deep Reinforcement Learning from Human Preferences"
paperUrl: "https://arxiv.org/abs/1706.03741"
authors: "Paul F. Christiano, Jan Leike, Tom B. Brown, Miljan Martic, Shane Legg, Dario Amodei"
venue: "NeurIPS"
year: 2017
references: ["trpo", "q-learning"]
description: 보상 함수를 설계하는 대신, 궤적 조각 쌍에 대한 인간의 선호 비교를 Bradley-Terry 모델로 학습해 보상 함수 자체를 추정하고, 그 학습된 보상으로 보통의 심층 강화학습을 돌리는 3자 루프(정책 학습–선호 수집–보상 학습)를 제안한다. 전체 스텝의 1% 미만에 대한 피드백만으로 Atari와 MuJoCo를 학습시키고, 보상 함수로는 쓸 수 없는 목표(백플립)를 900개 남짓의 비교만으로 가르쳐 RLHF의 원형이 된 논문.
---

## 한 줄 요약

이 시리즈의 모든 알고리즘은 보상이 **주어진다**고 가정했다 — 그런데 "잘 정리된 책상", "도움이 되는 답변" 같은 목표는 보상 함수로 쓸 수가 없다. 이 논문의 답: **보상 함수도 배우면 된다. 단, 데모가 아니라 비교로.** 사람에게 두 행동 영상 조각 중 나은 쪽만 고르게 하고(절대 점수보다 훨씬 쉽고 일관적인 판단이다), 그 선호를 재현하는 보상 함수 $\hat{r}_\psi$를 적합시킨 뒤, 그 위에서 보통의 RL을 돌린다. 5년 뒤 [InstructGPT](/papers/instructgpt/)가 LLM에 이식하는 RLHF 파이프라인의 원형이 정확히 이 구조다.

## 핵심 기여

- **선호 → 보상: Bradley-Terry 적합**: 궤적 조각(1~2초 클립) $\sigma^1, \sigma^2$에 대한 인간의 선택을, 잠재 보상의 합이 큰 쪽이 선택될 확률로 모델링한다:

$$\hat{P}[\sigma^1 \succ \sigma^2] = \frac{\exp \sum_t \hat{r}(s_t^1, a_t^1)}{\exp \sum_t \hat{r}(s_t^1, a_t^1) + \exp \sum_t \hat{r}(s_t^2, a_t^2)}$$

  이 확률의 교차 엔트로피를 최소화하면 $\hat{r}_\psi$가 나온다 — 체스 기사의 상대 실력을 승패에서 추정하는 Elo/Bradley-Terry 모델을 보상 추정에 돌려쓴 것. 이후 모든 RLHF 보상 모델 학습식이 이 한 줄이다.

- **비동기 3자 루프**: (1) 정책은 $\hat{r}_\psi$를 보상으로 보통의 RL(Atari는 A2C 계열, MuJoCo는 [TRPO](/papers/trpo/))로 학습하고, (2) 그 정책의 궤적에서 클립 쌍을 뽑아 사람에게 보내고, (3) 돌아온 라벨로 $\hat{r}_\psi$를 갱신한다 — 세 과정이 동시에 돈다. 비교 대상 선정은 보상 추정 앙상블의 **분산이 큰 쌍** 우선(불확실성 기반 능동 학습). 보상 모델이 비정상(non-stationary)으로 계속 바뀌는데도 정책 학습이 굴러간다는 것 자체가 당시의 실증적 발견이다.

- **표본 효율 — 피드백은 1%면 된다**: 에이전트-환경 상호작용 수천만 스텝 대비 인간 라벨은 수백~수천 개 — 전체 경험의 1% 미만에 대한 피드백으로 Atari 다수 게임과 MuJoCo 연속 제어에서 진짜 보상으로 학습한 것에 근접하거나(일부는 초과) 한다. 값싼 시뮬레이션 경험으로 정책의 뼈대를 만들고 비싼 인간 판단은 보상의 방향만 잡는 분업 — LLM에서 사전학습/정렬의 분업으로 재현되는 구도다.

- **보상 없는 목표의 학습**: 대표 장면 — MuJoCo Hopper에게 약 900개의 비교만으로 **백플립**을 가르친다. 백플립의 보상 함수를 손으로 쓰는 것은 사실상 불가능하지만, 사람은 백플립을 보면 안다. "명세는 못 해도 식별은 할 수 있는" 목표의 광대한 영역을 RL의 사정권에 넣은 것이 이 논문의 진짜 기여다. 동시에 경고도 남긴다 — 학습된 보상의 허점을 정책이 파고드는 **reward hacking**이 관찰되며(보상 모델을 고정하면 정책이 그 빈틈에 과적합한다), 이것이 RLHF의 고질병으로 이어진다.

## 계보에서의 위치

보상을 "환경이 주는 것"에서 "인간 판단으로부터 학습하는 것"으로 바꿔, 강화학습 문제 정의([(2)의 보상 가설](/insight/rl-mdp/))의 마지막 빈칸을 채운 논문이다. 직계가 명확하다 — 같은 Bradley-Terry 보상 모델 + [PPO](/papers/ppo/)를 요약 태스크에 적용한 Stiennon et al.(2020)을 거쳐, LLM 정렬의 표준이 된 [InstructGPT](/papers/instructgpt/)(2022)의 3단계 RLHF가 이 루프의 대규모 재연이다. 반대 방향의 후손도 있다 — 보상 모델과 RL을 아예 우회하고 선호에서 정책을 직접 미는 [DPO](/papers/dpo/)는 이 논문의 Bradley-Terry 가정을 그대로 물려받되 최적화만 갈아 끼운 것이다. RL이 LLM과 만나는 [시리즈 확장편](/insight/rl-llm/)의 출발점.
