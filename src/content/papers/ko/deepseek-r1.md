---
title: "DeepSeek-R1: 검증 가능한 보상만으로 추론이 창발하다"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Reasoning RL
tags: ["강화학습", "자연어 처리", "추론 모델", "DeepSeek", "GRPO", "RLVR"]
paper: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
paperUrl: "https://arxiv.org/abs/2501.12948"
authors: "DeepSeek-AI (Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, et al.)"
venue: "arXiv"
year: 2025
references: ["deepseek-math", "instructgpt", "chain-of-thought"]
description: 베이스 모델에 SFT 없이 규칙 기반 정오·형식 보상만으로 GRPO를 돌린 R1-Zero에서, 긴 chain-of-thought와 자기 검증·반성이 학습 과정에서 저절로 자라나는 것(aha moment)을 보인다 — AIME pass@1 15.6%에서 71.0%까지. 가독성 문제를 고치기 위해 콜드스타트 SFT와 다단계 파이프라인을 얹은 R1은 o1급 성능에 도달했고, 그 추론을 소형 모델로 증류한 체크포인트까지 공개해 o1-like 훈련의 공개 레시피가 된 논문.
---

## 한 줄 요약

o1이 보여준 "오래 생각할수록 잘하는" 추론 모델의 훈련법은 비공개였다. R1의 답은 놀랍도록 순수한 강화학습이다 — **R1-Zero**: 베이스 모델(V3)에 SFT도, 학습된 보상 모델도, 과정 감독도 없이, **답이 맞았는가(규칙 기반 채점)와 형식을 지켰는가**만을 보상으로 [GRPO](/papers/deepseek-math/)를 돌린다. 그러자 긴 [chain of thought](/papers/chain-of-thought/), 자기 검증, 대안 탐색, "잠깐, 다시 보자"류의 반성이 **아무도 가르치지 않았는데 학습 곡선 위에서 자라난다** — 응답 길이가 스스로 늘어나며 AIME 2024 pass@1이 15.6%에서 71.0%(다수결 86.7%)로 오른다. 추론이라는 능력이 데이터로 주입되는 것이 아니라 **보상으로 유인(incentivize)될 수 있다**는 실증이다.

## 핵심 기여

- **R1-Zero — 최소주의의 실험**: 보상은 두 개뿐이다: 정확도(수학은 정답 형식 비교, 코드는 컴파일·테스트 — **학습되지 않는, 해킹할 수 없는 채점기**)와 `<think>` 태그 형식 준수. 신경망 보상 모델을 쓰지 않은 것은 명시적 선택이다 — 대규모 RL에서 학습된 보상은 [reward hacking](/papers/rlhf/)당하고, [PRM](/papers/lets-verify-step-by-step/)은 단계 정의·주석 비용·hacking 문제로 기각했다고 밝힌다. "**검증 가능한 보상에 대한 RL(RLVR)**"이라는 이후 표준 설정의 선언이다.

- **창발의 기록**: 학습이 진행되며 모델이 **스스로 테스트 시점 계산을 늘린다** — 응답이 수백에서 수천 토큰으로 자라고, 그 안에 재검토·역추적·대안 시도가 나타난다. 논문이 "aha moment"라 부른 장면: 중간 단계에서 모델이 멈추고 "Wait, wait. That's an aha moment"라며 풀이를 재평가한다. [(6)에서 본 탐험](/insight/rl-model-free-control/)의 언어로 — 정오 보상만 주어진 정책이, 보상을 높이는 수단으로서 "더 오래 생각하기"라는 행동을 발견한 것이다.

- **R1 — 순수함의 대가와 파이프라인**: R1-Zero의 추론은 강하지만 읽기 어렵다(언어 섞임, 형식 혼란). R1은 4단계로 고친다: (1) 소량의 긴 CoT **콜드스타트 SFT**, (2) 추론 RL(+언어 일관성 보상), (3) 그 체크포인트로 **rejection sampling**해 만든 약 80만 샘플(추론 60만 + 일반 20만)로 재-SFT, (4) 전 시나리오 RL(추론은 규칙 보상, 일반 대화는 선호 보상). 결과는 AIME 79.8%, MATH-500 97.3% 등 o1급 — "순수 RL로 능력을 발견하고, SFT로 다듬고, 다시 RL로 밀어올리는" 교대 구조가 요체다.

- **증류 — 추론은 옮겨진다**: R1이 생성한 80만 샘플로 Qwen·Llama 1.5B~70B를 **SFT만으로** 증류하니, 소형 모델에 직접 RL을 돌린 것보다 훨씬 강했다(32B 증류 모델이 여러 벤치마크에서 o1-mini급). 큰 모델의 RL이 발견한 추론 패턴을 작은 모델은 모방으로 얻는 게 낫다 — 탐색은 비싸고 모방은 싸다는, [알파고 제로의 "탐색을 증류한다"](/papers/alphago-zero/)와 정확히 같은 구도의 재현이다.

## 계보에서의 위치

[GRPO](/papers/deepseek-math/)라는 도구와 [Cobbe식 "정답 키가 보상"](/papers/training-verifiers/) 설정이 만나, [CoT](/papers/chain-of-thought/)라는 행동 공간 위에서 o1-like 추론 훈련의 공개 레시피가 된 논문이다(이후 Nature에도 게재되며 학술 기록으로도 남았다). 시리즈의 렌즈로 보면 이 논문의 의미는 "**보상 신호가 신뢰할 수 있으면, 감독의 밀도(PRM)도 탐색 구조(MCTS)도 없이 순수 정책 최적화만으로 복잡한 행동이 창발한다**"는 데 있다 — 반대편에서 탐색+과정 보상으로 같은 급의 추론에 도달한 [rStar-Math](/papers/rstar-math/)와 좋은 대조를 이룬다. 훈련 세부(엔트로피 붕괴, 길이 편향 등)를 공개적으로 수술한 후속이 [DAPO](/papers/dapo/)다. 지형 전체는 [시리즈 확장편](/insight/rl-llm/) 참고.
