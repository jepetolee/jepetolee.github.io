---
title: "Generative Verifiers: 보상 모델링을 다음 토큰 예측으로 — GRM"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "Google DeepMind", "GenRM", "보상 모델"]
paper: "Generative Verifiers: Reward Modeling as Next-Token Prediction"
paperUrl: "https://arxiv.org/abs/2408.15240"
authors: "Lunjun Zhang, Arian Hosseini, Hritik Bansal, Mehran Kazemi, Aviral Kumar, Rishabh Agarwal"
venue: "arXiv"
year: 2024
references: ["lets-verify-step-by-step", "chain-of-thought"]
description: 판별식 분류기로 학습되던 검증자를 "이 풀이가 맞는가? Yes/No"의 다음 토큰 예측으로 재정식화한다 — 그 순간 검증자가 LLM의 모든 능력을 상속한다. 지시 튜닝과의 결합, 검증 자체에 대한 chain-of-thought(GenRM-CoT), 여러 검증 추론에 대한 다수결로 추론 시점 컴퓨트를 검증에도 투입하는 것까지 — 판별식 RM·LLM-as-a-Judge·자기검증을 일관되게 넘어서며 생성형 보상 모델(GRM) 노선을 연 논문.
---

## 한 줄 요약

[ORM](/papers/training-verifiers/)·[PRM](/papers/lets-verify-step-by-step/) 계열 검증자는 LLM 위에 스칼라 헤드를 얹은 **판별식 분류기**다 — 기반 모델이 가진 생성 능력(추론을 펼치고, 지시를 따르고, 샘플링으로 다양성을 내는)을 검증에는 전혀 쓰지 못한다. 이 논문의 재정식화: 검증을 **"Is the answer correct? — Yes/No"의 다음 토큰 예측**으로 학습하라. 점수는 Yes 토큰의 확률로 읽으면 된다. 형식을 바꿨을 뿐인데, 검증자가 갑자기 LLM의 모든 도구를 상속한다 — 이것이 **생성형 보상 모델(generative reward model, GRM)** 노선의 출발점이다.

## 핵심 기여

- **재정식화 자체**: 판별식 RM은 $r_\phi(x, y) \in \mathbb{R}$을 회귀/분류로 학습하지만, GenRM은 검증 프롬프트에 대한 토큰 분포 $p(\text{Yes} \mid x, y)$로 같은 정보를 표현한다. 이점 셋 — (1) 보상 모델 학습이 **그냥 SFT**가 되어 생성 데이터와 혼합 학습이 가능하고(검증과 풀이 생성을 한 모델이 겸하면 서로 돕는다는 것도 보인다), (2) 지시 튜닝·few-shot 등 LLM 기법이 그대로 이식되며, (3) 아래 둘이 열린다.

- **GenRM-CoT — 검증에도 사고 사슬을**: 판정 전에 **검증 근거를 [CoT](/papers/chain-of-thought/)로 생성**하게 한다("단계별로 풀이를 점검하라 → ... → Yes/No"). 미묘한 계산 오류나 논리 비약처럼 한눈에 안 보이는 결함은 검증 자체가 다단계 추론 문제인데, 판별식 헤드는 그 추론을 **한 번의 forward pass 안에서** 해내야 했다. GenRM-CoT는 그것을 토큰으로 펼친다 — 생성이 어려운 문제를 CoT로 푼 것과 정확히 같은 이유로, 검증이 어려운 문제를 CoT로 푸는 것이다.

- **검증에 test-time compute를**: 검증 CoT를 여러 개 샘플링해 Yes 확률을 평균(다수결)하면 검증 정확도가 컴퓨트와 함께 오른다 — 생성기의 best-of-N에 쓰이던 추론 시점 스케일링이 **검증자 쪽에도** 성립함을 보인 것. 알고리즘 과제·초등수학에서 판별식 RM, LLM-as-a-Judge(학습 없는 프롬프팅 판정), 자기일관성(self-consistency)을 일관되게 넘어서고, GSM8K에서 학습한 검증자가 MATH로 일반화하는 어려운 전이에서도 우위를 보인다. 검증자 모델 크기에 대한 스케일링도 판별식보다 유리하다.

- **위치 감각 — 만능은 아니다**: 검증 CoT 자체가 환각할 수 있고(검증자의 검증 문제), 라벨은 여전히 정오 기반이므로 결과 감독의 한계([PRM 논의](/papers/lets-verify-step-by-step/))를 근본적으로 벗어나는 것은 아니다 — 형식의 혁신이지 감독 신호의 혁신은 아니라는 것을 구분해 읽어야 한다.

## 계보에서의 위치

ORM(스칼라, 결과) → PRM(스칼라, 단계) 다음의 세 번째 축 — **표현 형식**(판별 → 생성)을 움직인 논문이다. "보상 모델도 결국 LLM이니 LLM답게 쓰라"는 원리는 이후 빠르게 표준화됐다 — 판정 근거를 생성하고 스스로 원칙을 세우는 생성형 RM 계열(DeepSeek의 GRM/Self-Principled Critique 노선 등)과, RLHF 파이프라인에서 판별식 RM을 생성형 판정자로 교체하는 흐름이 그 후손이다. 강화학습의 언어로는 가치 함수의 표현을 스칼라 헤드에서 **추론 궤적을 경유하는 함수**로 바꾼 것 — 평가에조차 계산(탐색)을 쓴다는 점에서 [(8)의 "결정 시점 계획"](/insight/rl-planning-mcts/)이 보상 모델링에 침투한 사례로 읽을 수 있다. 지형 전체는 [시리즈 확장편](/insight/rl-llm/) 참고.
