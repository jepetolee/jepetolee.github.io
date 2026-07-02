---
title: "Dyna: 경험으로 배우고, 상상으로 계획하다"
date: 2026-07-02
draft: false
category: 강화학습
subcategory: World Models
tags: ["강화학습", "ICML", "Dyna-Q", "model-based RL", "계획"]
paper: "Integrated Architectures for Learning, Planning, and Reacting Based on Approximating Dynamic Programming"
paperUrl: "https://doi.org/10.1016/B978-1-55860-141-3.50030-4"
authors: "Richard S. Sutton"
venue: "ICML"
year: 1990
references: ["td-learning", "q-learning", "actor-critic"]
description: 실제 경험으로는 가치·정책과 함께 세계 모델을 배우고, 그 모델이 생성한 가상 경험에도 같은 갱신 규칙을 적용해 반응(학습)과 계획을 하나의 알고리즘으로 통합하는 Dyna 아키텍처를 제안한다. 미로 실험에서 스텝당 가상 갱신 100회가 학습을 극적으로 가속하고, 탐험 보너스를 더한 Dyna-Q+는 변하는 환경(차단·지름길)에도 적응한다.
---

## 한 줄 요약

계획(planning)과 시행착오 학습은 오랫동안 다른 진영이었다 — 전자는 모델로 미리 계산하고, 후자는 경험으로 반응을 다듬는다. Dyna의 통합은 한 문장이다: **계획이란 가설적 경험에 적용된 시행착오 학습이다.** 실제 경험으로는 가치·정책과 함께 세계 모델을 배우고, 매 스텝 그 모델에서 뽑은 가상 전이 $k$개에 **정확히 같은 갱신 규칙**을 적용한다 — 미로에서 $k=100$이면 서너 번의 시도만에 최적 경로가 나온다. model-based 강화학습의 원점이자, "상상 속에서 학습한다"는 이후 계보 전체의 설계도다.

## 핵심 기여

- **Dyna의 내부 루프**: (1) 이번 스텝이 실제인지 가설인지 정한다, (2) 상태를 고른다(실제면 현재 상태, 가설이면 과거 방문 상태 중 무작위), (3) 정책으로 행동 선택, (4) 세계 **또는 세계 모델**에서 다음 상태와 보상을 얻는다, (5) 실제 경험이면 모델을 갱신(결정적 환경에선 next-state/reward 테이블), (6) 가치를 TD로 갱신, (7) 정책을 TD 오차 방향으로 갱신. **세계와 모델이 같은 인터페이스로 스위칭된다**는 것(Fig. 1)이 아키텍처의 전부다 — DP처럼 모델을 전수 순회하지 않고 샘플링만 하므로, 논문의 표현으로는 "근사 동적 계획법"이고 언제든 중단·재개 가능한 **점증적 계획**(relaxation planning)이 된다.

- **Dyna-PI와 Dyna-Q**: 첫 구현 Dyna-PI는 [1983년 actor-critic](/papers/actor-critic/)(평가 함수 + 정책의 2 구조)에 세계 모델을 더한 것. 이를 [Q-learning](/papers/q-learning/)으로 바꾼 **Dyna-Q**는 $Q_{xa} \leftarrow Q_{xa} + \beta(r + \gamma \max_b Q_{yb} - Q_{xa})$ 하나로 평가와 정책을 겸해 더 단순하고 — 결정적으로, **off-policy라서 가상 경험의 행동을 어떻게 골랐든 문제가 없다**(Dyna-PI는 가설 행동을 자유롭게 고르면 정책 편향 보정이 필요했다). model-based와 off-policy의 궁합이 여기서 처음 확인된다.

- **계획의 가속 효과**: 6×9 미로(보상은 골 도달 시 +1뿐)에서 스텝당 가상 갱신 $k = 0/10/100$ 비교 — $k=0$(순수 시행착오)은 시도마다 경로가 한 칸씩만 자라지만, $k=100$은 **두 번째 시도 중에 이미 정책이 시작점 근처까지 역전파**되어 서너 번째 시도에 최적 경로 완성. 실제 경험 한 조각을 모델이 수백 번 재활용하는, 표본 효율의 원형적 그림이다.

- **변하는 세계와 Dyna-Q+**: 학습 후 경로가 막히는 **blocking** 문제는 Dyna-Q가 풀지만(모델이 갱신되고 계획이 재전파), 더 짧은 길이 새로 열리는 **shortcut** 문제는 greedy로는 영영 발견 못 한다. 처방은 모델의 불확실성을 보상에 얹는 **탐험 보너스**: 상태-행동을 마지막으로 시도한 후 경과 시간 $n_{xa}$에 대해 $r + \epsilon\sqrt{n_{xa}}$로 가상 갱신 — "오래 안 가본 곳은 가볼 가치가 있다"를 계획 안에 심은 Dyna-Q+만이 지름길을 찾는다. 탐험이 행동 선택의 문제만이 아니라 **계획의 문제**이기도 하다는 통찰.

## 계보에서의 위치

[TD](/papers/td-learning/)·[Q-learning](/papers/q-learning/)의 model-free 갱신과 벨만의 model-based 계획([서론 글](/insight/rl-origins/)) 사이의 가교로, "학습·계획·반응은 세 시스템이 아니라 한 알고리즘의 세 용법"이라는 결론이 이 논문의 유산이다. 이 블로그의 [World Models](/papers/world-models/) 서브카테고리가 정확히 이 노선의 후손들이다 — 세계 모델이 테이블에서 VAE+RNN([World Models](/papers/world-models/)), 잠재 동역학([PlaNet](/papers/planet/)), 상상 속 롤아웃으로 정책까지 학습하는 [Dreamer](/papers/dreamer/)로 진화했을 뿐, "실제 경험으로 모델을 배우고 모델의 상상으로 정책을 개선한다"는 루프는 Dyna 그대로다. 탐험 보너스는 count-based/curiosity 탐험 연구의 원형이고, "경험의 재활용"이라는 발상은 replay buffer(DQN)와도 한 뿌리로 읽힌다.
