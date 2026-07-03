---
title: "Let's Verify Step by Step: 결과가 아니라 과정에 보상을 — PRM"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "ICLR", "OpenAI", "PRM", "신용 할당"]
paper: "Let's Verify Step by Step"
paperUrl: "https://arxiv.org/abs/2305.20050"
authors: "Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri Edwards, Bowen Baker, Teddy Lee, Jan Leike, John Schulman, Ilya Sutskever, Karl Cobbe"
venue: "ICLR"
year: 2024
references: ["training-verifiers", "chain-of-thought"]
description: 추론 풀이의 최종 답 정오만 감독하는 ORM과 각 추론 단계의 타당성을 감독하는 PRM을 MATH 벤치마크에서 정면 비교해, 과정 감독이 유의미하게 강력함을 보인다(best-of-1860 기준 PRM 78.2% vs ORM 72.4% vs 다수결 69.6%). 단계 라벨 80만 개의 PRM800K 공개, 라벨링 효율을 높이는 능동 학습, "정렬 관점에서도 과정 감독이 낫다"는 논증까지 — 추론에 대한 밀한 신용 할당의 기준점이 된 논문.
---

## 한 줄 요약

[Cobbe의 검증자](/papers/training-verifiers/)는 최종 답의 정오만 본다 — 틀린 논리로 맞은 답에 도달한 풀이를 걸러낼 수 없고, 어느 단계가 문제였는지도 말해주지 않는다. 이 논문은 감독의 해상도를 한 단계 내린다: **추론의 각 단계마다 사람이 타당/불명/오류를 라벨링**하고, 그것으로 단계별 보상 모델(**PRM**, Process Reward Model)을 학습한다. 같은 조건에서 결과 감독(**ORM**)과 정면 비교한 결과가 이 논문의 존재 이유다 — 어려운 MATH 문제에서 PRM의 best-of-N 선택이 ORM을 일관되게, 그리고 N이 클수록 더 크게 이긴다.

## 핵심 기여

- **문제 설정 — 신용 할당의 해상도**: ORM은 풀이 전체에 스칼라 하나, PRM은 단계마다 하나를 준다. 강화학습의 언어로 정확히 [(4)에서 다룬 신용 할당 문제](/insight/rl-mc-td/)다 — 에피소드 끝의 보상 하나(MC적 감독)로는 어느 스텝이 잘못인지 흐릿하고, 스텝별 신호(TD적 감독)는 밀하지만 라벨이 비싸다. 이 논문은 그 비싼 쪽을 대규모로 실제 구매해서 값어치를 측정한 실험이다.

- **PRM800K와 비교 결과**: GPT-4 계열 생성기의 MATH 풀이에 대해 **80만 개의 단계 라벨**(PRM800K, 공개)을 수집. 평가는 best-of-N — 생성기에서 N개 풀이를 뽑아 보상 모델이 고른 것의 정답률. N=1860에서 **PRM 78.2%, ORM 72.4%, 다수결 69.6%**. 격차가 N과 함께 벌어지는 것이 중요하다 — 후보가 많아질수록 "그럴듯하지만 틀린" 풀이가 늘고, 그것을 걸러내는 능력에서 과정 감독의 우위가 드러난다.

- **능동 학습**: 아무 풀이나 라벨링하지 않는다 — **현재 PRM이 높게 평가하는데 답은 틀린**(convincing wrong-answer) 풀이를 우선 보여줘, 라벨 하나가 모델의 착각 하나를 교정하게 한다. 데이터 효율을 유의미한 배수로 끌어올렸다고 보고한다 — [(5)의 불확실성 기반 탐험](/insight/rl-bandits-ucb/)이 라벨 수집에 적용된 모양새다.

- **정렬 논증**: 과정 감독은 성능-안전 트레이드오프가 아니라 둘 다에 좋다고 주장한다 — 결과만 보상하면 "수단을 가리지 않고 답만 맞추는" 정책([reward hacking](/papers/rlhf/)의 추론판)이 강화될 수 있지만, 과정 보상은 **인간이 승인하는 추론 과정 자체**를 직접 강화한다. 이후 "결과 보상 RL이 만든 추론을 사람이 읽을 수 있는가"라는 [R1](/papers/deepseek-r1/)의 가독성 문제를 예고하는 대목이기도 하다.

## 계보에서의 위치

ORM([Cobbe 2021](/papers/training-verifiers/))이 연 검증자 노선의 해상도를 완성한 논문이고, "PRM vs ORM"은 이후 추론 시스템 설계의 표준 어휘가 됐다. 다만 후일담이 이중적이다 — best-of-N과 단계별 탐색([rStar-Math](/papers/rstar-math/)는 MCTS의 단계 가치를 선호쌍으로 바꿔 PRM 학습의 주석 비용 문제를 우회한다)에서는 PRM이 핵심 부품으로 남은 반면, 대규모 추론 RL에서는 [R1](/papers/deepseek-r1/)이 PRM을 시도 후 **명시적으로 기각**한다(단계 정의의 모호함, 주석 비용, 그리고 학습되는 보상 모델의 숙명인 reward hacking) — 검증 가능한 최종 정오(규칙 기반 ORM에 가까운 것)만으로 규모를 밀었다. 밀한 신용 할당이 "필요한가, 아니면 규모가 대신하는가"는 여전히 열린 문제다. 지형 전체는 [시리즈 확장편](/insight/rl-llm/) 참고.
