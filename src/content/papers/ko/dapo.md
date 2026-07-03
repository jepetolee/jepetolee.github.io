---
title: "DAPO: 추론 RL의 훈련 세부를 전부 공개하고 수술하다"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "DAPO", "GRPO", "RLVR"]
paper: "DAPO: An Open-Source LLM Reinforcement Learning System at Scale"
paperUrl: "https://arxiv.org/abs/2503.14476"
authors: "Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, et al. (ByteDance Seed, 칭화 AIR)"
venue: "arXiv"
year: 2025
references: ["deepseek-math", "deepseek-r1", "ppo"]
description: o1·R1급 추론 RL의 은폐된 훈련 세부를 재현 가능하게 공개한 시스템 논문 — GRPO를 그대로 쓰면 부딪히는 네 가지 실패(엔트로피 붕괴, 무효 그래디언트 집단, 긴 응답의 신용 희석, 잘린 응답의 보상 잡음)를 Clip-Higher, Dynamic Sampling, 토큰 수준 손실, Overlong Reward Shaping으로 하나씩 수술해, Qwen2.5-32B로 AIME 2024 50점을 절반의 스텝으로 달성하고 코드·데이터·알고리즘 전부를 공개했다.
---

## 한 줄 요약

[R1](/papers/deepseek-r1/)은 레시피의 골격을 공개했지만, 대규모 추론 RL을 실제로 굴릴 때 부딪히는 훈련의 세부는 여전히 각자의 시행착오였다. DAPO는 그 세부를 정면으로 다룬다 — [GRPO](/papers/deepseek-math/)를 그대로 쓰면 만나는 네 가지 병리를 진단하고, 각각에 외과적 수정을 하나씩 붙인 **Decoupled Clip and Dynamic sAmpling Policy Optimization**으로, Qwen2.5-32B 베이스에서 AIME 2024 **50점**(같은 베이스의 R1식 GRPO 재현이 47점, 그것도 절반의 학습 스텝으로)을 달성하고 시스템 전체(알고리즘·코드·데이터셋)를 공개했다. 알고리즘 신설 논문이라기보다, **추론 RL의 공학을 처음으로 재현 가능하게 문서화한** 논문이다.

## 핵심 기여

- **Clip-Higher — 클리핑 비대칭화**: [PPO](/papers/ppo/)식 클리핑 $[1-\epsilon, 1+\epsilon]$은 대칭이지만 효과는 비대칭이다 — 확률이 이미 낮은 토큰은 $(1+\epsilon)$배가 되어봤자 절대 증가량이 미미해서, **저확률의 탐험적 토큰이 확률을 얻을 길이 위쪽 클립에 막힌다**. 결과가 엔트로피 붕괴(정책이 빠르게 결정적이 되며 탐험 소멸)다. 처방: 상한과 하한을 분리(decouple)하고 상한 $\epsilon_{\text{high}}$만 올린다 — [(6)에서 본 탐험 보장](/insight/rl-model-free-control/)이 클리핑 상수의 비대칭이라는 미시 설계로 들어온 것.

- **Dynamic Sampling — 무효 그래디언트 제거**: GRPO의 advantage는 집단 내 상대 성적이므로, 한 프롬프트의 응답 $G$개가 **전부 맞거나 전부 틀리면 advantage가 일괄 0** — 그 프롬프트는 그래디언트에 아무 기여도 없다. 학습이 진행될수록 "전부 맞는" 쉬운 문제가 늘어 유효 배치가 조용히 쪼그라든다. 처방: 그런 집단을 걸러내고 유효 프롬프트로 배치가 찰 때까지 계속 샘플링한다 — 배치 크기가 아니라 **유효 그래디언트의 양**을 일정하게 유지하는 것.

- **Token-Level Policy Gradient Loss**: GRPO는 응답(샘플) 단위로 손실을 평균하므로 긴 응답 안의 토큰들이 1/길이로 희석된다 — 긴 추론에서 결정적이었던 토큰들이 과소 학습되고, 반대로 길기만 한 쓰레기 패턴은 벌점이 묽어진다. 처방: 배치의 **모든 토큰에 걸쳐** 평균하는 토큰 수준 손실 — 긴 CoT가 학습의 주 무대인 추론 RL에서 특히 중요해지는, 신용 할당 해상도의 수정이다.

- **Overlong Reward Shaping**: 길이 상한에 잘려 미완으로 끝난 응답에 일괄 벌점을 주면, **추론이 좋았는데 길었을 뿐인** 궤적이 처벌되어 보상에 잡음이 낀다. 처방: 잘린 표본의 손실 기여를 거르고(Overlong Filtering), 상한 근처부터 부드럽게 증가하는 길이 벌점(Soft Overlong Punishment)으로 절벽을 경사로로 바꾼다 — 보상 설계의 잡음이 학습 안정성을 좌우한다는, [reward shaping](/papers/rlhf/) 원칙의 실전 사례.

이 밖에 KL 페널티 항의 **제거**(장기 추론 RL에서는 정책이 참조 모델에서 멀어지는 것이 목적 그 자체이므로)도 눈여겨볼 선택이고, 훈련 중 응답 길이·보상·엔트로피 곡선의 동학까지 공개한 것이 시스템 논문으로서의 값어치다.

## 계보에서의 위치

[GRPO](/papers/deepseek-math/)→[R1](/papers/deepseek-r1/)로 이어진 추론 RL 노선의 **공학적 안정화 계층**이다 — 네 처방이 각각 시리즈의 고전 주제로 소급된다는 점이 흥미롭다: Clip-Higher는 탐험-활용([(5)](/insight/rl-bandits-ucb/)·[(6)](/insight/rl-model-free-control/)), Dynamic Sampling은 유효 표본과 분산([(4)](/insight/rl-mc-td/)), 토큰 수준 손실은 신용 할당의 해상도, Overlong Shaping은 보상 설계. verl 기반 공개 구현과 함께 이후 오픈소스 추론 RL(다수의 R1 재현 프로젝트)의 사실상 참조 구현이 됐다. 지형 전체는 [시리즈 확장편](/insight/rl-llm/) 참고.
