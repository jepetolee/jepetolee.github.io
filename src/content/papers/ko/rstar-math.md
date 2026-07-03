---
title: "rStar-Math: 작은 모델 + MCTS — 알파고 제로의 루프가 수학 추론으로"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "Microsoft Research", "MCTS", "PRM"]
paper: "rStar-Math: Small LLMs Can Master Math Reasoning with Self-Evolved Deep Thinking"
paperUrl: "https://arxiv.org/abs/2501.04519"
authors: "Xinyu Guan, Li Lyna Zhang, Yifei Liu, Ning Shang, Youran Sun, Yi Zhu, Fan Yang, Mao Yang (Microsoft Research Asia)"
venue: "arXiv"
year: 2025
references: ["uct", "alphago-zero", "lets-verify-step-by-step", "chain-of-thought"]
description: 1.5B~7B급 소형 모델이 MCTS 기반 깊은 사고(deep thinking)로 o1급 수학 추론에 도달함을 보인다 — 각 추론 단계에 파이썬 코드를 붙여 실행 검증하는 code-augmented CoT로 MCTS 롤아웃의 단계별 품질을 보증하고, MCTS의 Q값을 점수 라벨이 아니라 선호쌍으로 바꿔 과정 선호 모델(PPM)을 학습하며, 정책과 PPM을 4라운드에 걸쳐 상호 진화시킨다. Qwen2.5-Math-7B가 MATH 58.8→90.0%, AIME 53.3%로 o1-preview를 넘어선, 탐색 노선의 대표 실증.
---

## 한 줄 요약

[R1](/papers/deepseek-r1/)이 "큰 모델 + 순수 RL"로 추론을 창발시켰다면, 같은 달의 rStar-Math는 반대쪽 극단을 실증한다 — **작은 모델(1.5B~7B)이라도, 결정 시점에 MCTS로 깊게 탐색하고 그 탐색이 만든 데이터로 자신을 반복 개선하면** o1급 수학 추론에 도달한다. 구도가 정확히 [알파고 제로](/papers/alphago-zero/)다: 정책(소형 LM) + 가치/보상(과정 선호 모델, PPM) + 탐색(MCTS)이 self-play 아닌 self-evolution 루프를 돌며 서로를 밀어 올린다. 시리즈에서 쌓은 [(8)의 탐색](/insight/rl-planning-mcts/)이 LLM 추론으로 돌아오는 지점이다.

## 핵심 기여

- **Code-augmented CoT — 단계 검증을 실행으로**: MCTS 롤아웃으로 학습 데이터를 만들 때의 고질병은 "그럴듯하지만 틀린 중간 단계"다. 처방: 각 추론 단계마다 자연어와 함께 **그 단계를 수행하는 파이썬 코드를 생성하게 하고, 실행에 성공한 단계만 후보로 남긴다** — 단계 수준의 오류를 주석자 없이 기계적으로 걸러내는 장치다. [Cobbe의 "정답 키가 라벨을 만든다"](/papers/training-verifiers/)를 단계 해상도로 내린 셈.

- **PPM — Q값을 점수가 아니라 선호로**: MCTS를 돌리면 각 단계의 Q값([UCT](/papers/uct/)의 방문 통계)이 나오지만, 이 값을 그대로 단계 점수 라벨로 회귀하면 잡음이 심하다(Q값의 절대 크기는 신뢰하기 어렵다). 처방: **같은 부모에서 Q값이 높은 단계와 낮은 단계를 쌍으로 묶어 선호 학습** — [PRM](/papers/lets-verify-step-by-step/)의 인간 단계 주석(PRM800K식)을 탐색 통계로 대체하되, 절대 점수가 아니라 순위만 믿는다. "Q값의 크기는 못 믿어도 순서는 믿을 만하다"는, [Bradley-Terry 계열](/papers/rlhf/) 전체와 공명하는 설계 판단이다.

- **4라운드 self-evolution**: 1라운드는 부트스트랩(더 강한 모델로 초기 데이터 생성), 이후 라운드마다 — 현재 정책+PPM으로 74.7만 문제에 MCTS를 돌려 더 나은 궤적을 수집하고, 그것으로 정책과 PPM을 재학습하고, 다음 라운드는 더 강해진 둘로 더 어려운 문제까지 뚫는다. 라운드가 갈수록 다루는 문제의 난도와 궤적 품질이 함께 오르는, [(3)의 GPI](/insight/rl-dynamic-programming/)가 데이터 생성 루프로 구현된 형태다 — 탐색이 정책 개선 연산자라는 [알파고 제로의 원리](/papers/alphago-zero/) 그대로.

- **결과와 창발**: Qwen2.5-Math-7B가 MATH **58.8 → 90.0%**, Phi3-mini-3.8B가 41.4 → 86.4%로 o1-preview를 넘고, AIME에서 평균 8/15(**53.3%**). 부수 관찰도 인상적이다 — 학습시키지 않았는데 MCTS 탐색 중 모델이 막다른 경로에서 **스스로 되돌아와 재시도하는 내재적 자기 반성**이 나타난다. [R1의 "aha moment"](/papers/deepseek-r1/)가 순수 RL에서 창발했다면, 여기서는 탐색 구조가 같은 행동을 유도한다.

## 계보에서의 위치

추론 확장의 두 노선 — **훈련 시점 RL로 정책 자체를 키우는 R1 노선**과 **결정 시점 탐색으로 작은 정책을 증폭하는 rStar 노선** — 중 후자의 대표 실증이고, 그 대비가 정확히 이 시리즈의 [model-free control(6)](/insight/rl-model-free-control/) vs [계획(8)](/insight/rl-planning-mcts/)의 축이다. 흥미로운 것은 비용의 이동이다: R1은 훈련에 크게 쓰고 추론은 단일 롤아웃, rStar-Math는 훈련은 싸지만 문제당 수십 회의 MCTS 롤아웃을 추론 시점에 지불한다 — [(8)에서 본 배경 계획 vs 결정 시점 계획](/insight/rl-planning-mcts/)의 트레이드오프가 LLM 시대의 컴퓨트 예산 문제로 재등장한 것이다. 지형 전체는 [시리즈 확장편](/insight/rl-llm/) 참고.
