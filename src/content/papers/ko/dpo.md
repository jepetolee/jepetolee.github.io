---
title: "DPO: 당신의 언어 모델은 이미 보상 모델이다"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: RLHF & Alignment
tags: ["강화학습", "자연어 처리", "NeurIPS", "DPO", "RLHF", "선호 최적화"]
paper: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"
paperUrl: "https://arxiv.org/abs/2305.18290"
authors: "Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, Chelsea Finn"
venue: "NeurIPS"
year: 2023
references: ["rlhf", "instructgpt", "ppo"]
description: KL 제약 보상 최대화 문제의 최적 정책이 닫힌 형태로 풀린다는 사실을 역이용해, 보상을 정책의 로그 확률비로 재매개변수화하고 Bradley-Terry 선호 우도에 대입한다 — 그 결과 보상 모델 학습도, 샘플링도, PPO도 없이 선호 데이터에 대한 단일 분류 손실만으로 RLHF와 같은 최적해를 겨냥하는 Direct Preference Optimization. RLHF의 3단계 파이프라인을 지도학습 한 단계로 접은, 정렬 실무를 바꾼 논문.
---

## 한 줄 요약

[RLHF](/papers/rlhf/)/[InstructGPT](/papers/instructgpt/) 파이프라인은 무겁다 — 보상 모델을 따로 학습하고, LLM에서 샘플링하며 [PPO](/papers/ppo/)를 돌리고, 그 과정 전체가 불안정하고 하이퍼파라미터에 민감하다. DPO의 관찰: RLHF가 푸는 KL 제약 보상 최대화는 **최적해가 닫힌 형태로 알려진 문제**이고, 그 식을 뒤집으면 보상을 정책으로 표현할 수 있다 — 그러면 보상 모델 학습 손실(Bradley-Terry)에 그 표현을 대입하는 순간, **정책에 대한 직접적인 분류 손실**이 나온다. RL 루프 전체가 수식 변형 한 번으로 사라진다.

## 핵심 기여

- **재매개변수화 트릭**: RLHF의 목적 $\max_\pi \mathbb{E}[r(x,y)] - \beta D_{\mathrm{KL}}(\pi \,\Vert\, \pi_{\text{ref}})$의 최적 정책은 $\pi^*(y|x) \propto \pi_{\text{ref}}(y|x) \exp(r(x,y)/\beta)$ — 이를 $r$에 대해 풀면

$$r(x, y) = \beta \log \frac{\pi^*(y \mid x)}{\pi_{\text{ref}}(y \mid x)} + \beta \log Z(x)$$

  분배 함수 $Z(x)$는 계산 불가지만, Bradley-Terry는 **두 응답의 보상 차이**만 쓰므로 $Z$가 소거된다. 대입하면:

$$\mathcal{L}_{\text{DPO}} = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \Big( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{\text{ref}}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{\text{ref}}(y_l \mid x)} \Big) \right]$$

  — 정책의 로그 확률비가 **암묵적 보상(implicit reward)** 역할을 한다. "언어 모델은 이미(secretly) 보상 모델"이라는 제목의 뜻이다.

- **그래디언트가 하는 일**: 손실을 미분하면 가중치 $\sigma(\hat{r}_\theta(y_l) - \hat{r}_\theta(y_w))$ — **암묵적 보상이 선호 순서를 틀리게 매기고 있는 예시일수록 크게 갱신**된다. 선호 쌍을 무차별하게 밀어올리는 소박한 우도 기반 방법과의 차이가 이 가중에 있고, β는 참조 정책에서 얼마나 벗어날지를 정하는 (7)에서 본 "보폭" 손잡이의 역할을 그대로 한다.

- **실증**: 감정 제어 생성, 요약(TL;DR), 대화(Anthropic HH)에서 PPO 기반 RLHF와 대등하거나 나은 선호 승률을, 훨씬 단순한 학습(샘플링 없음, 보상 모델 없음, 지도학습 인프라 그대로)으로 달성한다. 특히 샘플링 온도 변화에 PPO보다 강건했다.

- **정직한 한계**: DPO의 최적해는 이론상 RLHF와 같지만, 그것은 선호 데이터 분포 위에서의 이야기다 — **정책이 스스로 만든 새 데이터로 보상의 빈틈을 탐색하는 on-policy 루프가 없으므로**, 분포 밖 일반화와 지속적 개선에서는 RL 계열과 갈린다. 이후 검증 가능한 보상 영역(수학·코드)에서 [GRPO](/papers/deepseek-math/)·[R1](/papers/deepseek-r1/) 같은 진짜 RL이 다시 주류가 되는 것과, 선호 정렬 영역에서 DPO 계열이 표준으로 남는 분업의 이유가 여기 있다.

## 계보에서의 위치

[RLHF](/papers/rlhf/)의 Bradley-Terry 가정은 유지한 채 RL만 제거한 것 — 강화학습의 언어로는, 문제의 구조(닫힌 형태 최적해)를 알면 정책 탐색이 회귀로 바뀐다는 사례다. 폭발적인 변주가 뒤따랐다: 참조 모델마저 제거한 ORPO/SimPO, 쌍 대신 개별 라벨을 쓰는 KTO, 우도 하락 문제를 앵커로 제어하는 [APO](/papers/apo/) 등 — 특히 APO는 DPO 손실이 "확률비의 차이"만 제약할 뿐 $\pi(y_w)$와 $\pi(y_l)$의 **절대** 움직임은 미명세(underspecified)라는 약점(둘 다 내려가면서도 손실은 줄 수 있다)을 정면으로 다룬다. RL×LLM 지형 전체에서의 위치는 [시리즈 확장편](/insight/rl-llm/) 참고.
