---
title: "DeepSeekMath: critic을 집단 평균으로 대체하다 — GRPO"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "DeepSeek", "GRPO", "PPO"]
paper: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models"
paperUrl: "https://arxiv.org/abs/2402.03300"
authors: "Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, et al. (DeepSeek-AI)"
venue: "arXiv"
year: 2024
references: ["ppo", "chain-of-thought", "instructgpt"]
description: Common Crawl에서 캐낸 120B 토큰의 수학 코퍼스로 7B 모델을 사전학습해 수학 특화 오픈 모델의 기준을 올리고, PPO의 가치망(critic)을 "같은 문제에 대한 G개 응답의 집단 내 상대 보상"으로 대체한 GRPO(Group Relative Policy Optimization)를 제안한다. critic 메모리를 통째로 없애면서 MATH 51.7%를 달성한 이 알고리즘이 이후 R1과 오픈소스 추론 RL 전체의 기본 최적화기가 된다.
---

## 한 줄 요약

이 논문의 표면은 데이터 이야기다 — Common Crawl에서 수학 웹페이지를 반복 분류·수집한 120B 토큰으로 7B 모델을 사전학습하니 오픈 모델 수학 성능의 기준이 크게 올랐다는 것. 그러나 유산이 된 것은 5장의 알고리즘이다: **GRPO** — [PPO](/papers/ppo/)에서 정책만큼 큰 **가치망(critic)을 제거**하고, advantage를 "같은 프롬프트에 대한 $G$개 응답들의 집단 내 상대 성적"으로 추정한다. LLM RL의 실무적 병목(critic의 메모리·학습 불안정)을 문제의 구조(한 프롬프트에서 여러 응답을 뽑을 수 있다)로 우회한 설계이고, [R1](/papers/deepseek-r1/)을 포함한 이후 추론 RL의 사실상 표준이 됐다.

## 핵심 기여

- **GRPO의 갱신식**: 프롬프트 $x$마다 이전 정책에서 응답 $G$개를 뽑아 보상 $r_1, \ldots, r_G$를 받고, advantage를 **집단 표준화**로 정의한다:

$$\hat{A}_i = \frac{r_i - \mathrm{mean}(r_1, \ldots, r_G)}{\mathrm{std}(r_1, \ldots, r_G)}$$

  이를 PPO와 같은 클리핑 surrogate에 넣되, KL 페널티는 보상에 섞지 않고 손실에 직접 더한다(저분산의 unbiased 추정기 사용). 읽는 법 — [(7)에서 본 baseline](/insight/rl-policy-gradient/)의 역할($V(s)$를 빼서 분산을 줄인다)을 **학습된 가치망 대신 형제 응답들의 표본 평균**이 수행한다. 상태(프롬프트)가 같은 표본이 $G$개씩 공짜로 생기는 LLM 설정이라 가능한 치환이며, 보상 모델이 어차피 비교 기반으로 학습된다는 점과도 결이 맞는다.

- **무엇을 버렸는지도 정확히**: critic이 없으므로 토큰 단위 가치 추정(밀한 신용 할당)은 포기한다 — 한 응답 안의 모든 토큰이 같은 advantage를 공유한다. [(4)의 언어](/insight/rl-mc-td/)로 GRPO는 MC 쪽 극단(에피소드 단위 신용 할당)이고, PPO+GAE는 TD(λ) 쪽이다. 검증 가능한 보상(정오)이 에피소드 끝에만 있는 수학 추론에서는 이 포기가 싸게 먹힌다는 것이 실증의 요지다.

- **통합 패러다임 분석**: SFT, RFT(rejection sampling 후 SFT), [DPO](/papers/dpo/), PPO, GRPO를 전부 "무엇을 데이터 소스로, 무엇을 그래디언트 계수로 쓰는가"의 변주로 정리한다 — 방법 간 차이가 (i) on-policy인가, (ii) 계수가 상수인가/보상 기반인가로 환원된다는 이 절은 정렬 알고리즘 지형의 좋은 지도다.

- **결과**: 수학 코퍼스 사전학습 + 지시 튜닝 + GRPO로 7B 모델이 **MATH 51.7%**(당시 오픈 모델 최고 수준, 수십 배 큰 모델들과 경쟁) — 그리고 흥미로운 관찰로, RL의 이득이 주로 **분포의 재배열**(맞는 풀이가 top-1으로 올라오는 것, Maj@K 향상)에서 온다는 분석을 남긴다. 근본적으로 새 능력을 만드는가, 이미 있는 능력을 끌어올리는가 — [R1](/papers/deepseek-r1/) 이후까지 이어지는 논쟁의 시작점이다.

## 계보에서의 위치

[InstructGPT](/papers/instructgpt/)가 표준화한 "LLM RL = PPO"를 처음으로 대규모에서 대체한 알고리즘이다. 계보적 아이러니가 하나 있다 — [PPO](/papers/ppo/)는 [TRPO](/papers/trpo/)의 2차 계산을 덜어낸 단순화였는데, GRPO는 그 PPO에서 critic마저 덜어냈다. 정책 최적화의 역사가 "이론 장치를 하나씩 떼며 규모를 얻는" 방향으로 반복되는 셈이다. 직계 후속으로 GRPO를 그대로 물려받아 추론 능력을 창발시킨 [DeepSeek-R1](/papers/deepseek-r1/), 그리고 GRPO의 세부 결함(엔트로피 붕괴, 무효 그래디언트 집단, 길이 편향)을 수술한 [DAPO](/papers/dapo/)가 있다. RL×LLM 지형에서의 위치는 [시리즈 확장편](/insight/rl-llm/) 참고.
