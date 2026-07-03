---
title: "Chain-of-Thought: 중간 추론을 말하게 하면 능력이 창발한다"
date: 2026-07-03
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "추론 모델", "NeurIPS", "Google Research", "Chain-of-Thought", "프롬프팅"]
paper: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
paperUrl: "https://arxiv.org/abs/2201.11903"
authors: "Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou"
venue: "NeurIPS"
year: 2022
references: ["gpt-3"]
description: 프롬프트의 few-shot 예시에 정답만이 아니라 정답에 이르는 중간 추론 단계를 함께 써 주면, 충분히 큰 언어 모델이 새 문제에서도 단계적 추론을 흉내 내며 산술·상식·기호 추론 성능이 뛰어오른다는 것을 보인 논문. 이 효과가 모델 규모에 대해 창발적으로 나타난다는 관찰과 함께, 이후 추론 모델 전체가 딛고 서는 "생각을 토큰으로 펼친다"는 기본 형식을 만들었다.
---

## 한 줄 요약

[GPT-3](/papers/gpt-3/)의 few-shot 프롬프팅은 "입력 → 정답" 예시를 보여주는 것이었다. 이 논문의 수정은 사소해 보인다 — 예시에 **정답까지 가는 중간 추론(chain of thought)을 함께 써 준다**. 효과는 사소하지 않다: PaLM 540B의 GSM8K(초등 수학 문장제) 정확도가 표준 프롬프팅 대비 수 배로 뛰어 당시 파인튜닝 SOTA를 넘었다. 더 중요한 것은 형식의 발명이다 — **추론을 토큰 시퀀스로 외화(externalize)하면, 다음 토큰 예측기가 다단계 문제에 중간 계산을 배분할 수 있게 된다**. 이후의 검증자([PRM](/papers/lets-verify-step-by-step/))도, 추론 RL([R1](/papers/deepseek-r1/))도 전부 이 형식 위에서 작동한다.

## 핵심 기여

- **방법 — 8개의 예시면 된다**: 파인튜닝도, 아키텍처 변경도 없다. few-shot 예시 각각에 "질문 → 자연어 추론 단계들 → 정답"을 손으로 써 넣을 뿐. 모델은 새 질문에 대해 같은 형식을 모방하며 스스로 추론 단계를 생성한 뒤 답한다. 산술(GSM8K, SVAMP 등), 상식(StrategyQA), 기호 조작(동전 뒤집기, 마지막 글자 잇기)에 걸쳐 일관된 향상.

- **창발성 — 규모의 문턱**: 핵심 관찰이자 논쟁의 씨앗 — CoT의 이득은 **~100B 파라미터급 이상에서만** 나타난다. 작은 모델은 유창하지만 논리가 틀린 추론을 생성해 오히려 성능이 떨어지기도 한다. 능력이 규모에 대해 매끄럽지 않게 나타나는 "창발" 서사의 대표 사례가 됐다(측정 방식의 인공물이라는 반론도 이후 제기된다 — 정답 일치라는 불연속 지표 때문에 급증처럼 보인다는 것).

- **왜 되는가에 대한 통제 실험**: 방정식만 쓰게 하기(자연어 추론이 핵심임을 확인), 답 전에 점(...)만 찍게 하기(추가 계산 토큰 자체는 무효 — **내용 있는 중간 상태**가 필요), 추론을 답 뒤에 쓰게 하기(효과 소멸 — 추론이 답 **생성에 선행**해야 한다) — "생각이 먼저, 답이 나중"이라는 인과 방향을 소거법으로 세운다.

- **한계의 정직한 기록**: 생성된 추론이 그럴듯하지만 틀린 경우(계산 실수, 한 단계 누락)가 남고, 옳은 답에 틀린 추론이 붙기도 한다 — **추론의 충실성(faithfulness) 문제**다. 이 틈이 정확히 후속 연구의 지도가 된다: 여러 추론 경로를 샘플링해 다수결하는 self-consistency, 단계별로 검증하는 [PRM](/papers/lets-verify-step-by-step/), 추론 자체를 보상으로 강화하는 [추론 RL](/papers/deepseek-r1/).

## 계보에서의 위치

프롬프팅 기법으로 발표됐지만, 회고적으로는 **추론 모델 시대의 기반 형식**을 만든 논문이다. 강화학습의 언어로 번역하면 이 형식의 의미가 선명해진다 — CoT는 "질문 → 답"이라는 단일 스텝 문제를 **토큰 단위의 순차적 결정 과정(MDP)으로 펼친 것**이고, 그래야 비로소 중간 상태에 가치를 매기고([PRM/ORM](/papers/lets-verify-step-by-step/)), 경로를 탐색하고([rStar-Math](/papers/rstar-math/)의 MCTS), 좋은 경로를 강화([GRPO](/papers/deepseek-math/), [R1](/papers/deepseek-r1/))할 **행동 공간**이 생긴다. "o1-like" 추론 모델이란 결국 이 CoT를 프롬프팅 기교가 아니라 RL의 궤적으로 다루는 것 — 그 전환의 이야기가 [시리즈 확장편](/insight/rl-llm/)이다.
