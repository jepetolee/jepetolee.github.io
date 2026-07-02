---
title: "InstructGPT: RLHF로 언어 모델을 사용자 의도에 정렬하다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "강화학습", "NeurIPS", "OpenAI", "InstructGPT", "RLHF", "PPO"]
paper: "Training Language Models to Follow Instructions with Human Feedback"
paperUrl: "https://arxiv.org/abs/2203.02155"
authors: "Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, et al."
venue: "NeurIPS"
year: 2022
references: ["gpt-3", "ppo"]
description: SFT → 보상 모델 학습 → PPO라는 3단계 RLHF 파이프라인으로 GPT-3를 사용자 지시에 정렬한다. 인간 평가에서 1.3B InstructGPT의 출력이 100배 큰 175B GPT-3보다 선호되었고, 사전학습 그래디언트 혼합(PPO-ptx)으로 정렬세를 상쇄하는 방법까지 제시했다.
---

## 한 줄 요약

"웹 텍스트의 다음 토큰 예측"이라는 사전학습 목적함수는 "사용자의 지시를 유용하고 안전하게 따르라"는 실제 사용 목적과 다르다 — 모델이 크다고 정렬되는 게 아니다. 이 논문은 SFT → 보상 모델 → PPO의 3단계 RLHF 파이프라인으로 GPT-3를 인간 선호에 정렬했고, 그 결과 **1.3B짜리 InstructGPT가 100배 큰 175B GPT-3보다 선호**되었다. ChatGPT의 직접적 기술 기반이 된 논문이다.

## 핵심 기여

- **1단계 — SFT**: 라벨러가 작성하거나 API에서 수집한 ~13k 프롬프트에 대해 시연 응답을 작성하고 GPT-3를 16에폭 지도 미세조정한다.

- **2단계 — 보상 모델(RM)**: 프롬프트당 $K=4{\sim}9$개의 모델 출력을 라벨러가 순위 매긴 33k 프롬프트 비교 데이터로, 6B 모델(175B RM은 학습이 불안정했다)에 pairwise 순위 손실을 학습한다:

$$\text{loss}(\theta) = -\frac{1}{\binom{K}{2}} \mathbb{E}_{(x, y_w, y_l) \sim D} \left[ \log \sigma\!\left( r_\theta(x, y_w) - r_\theta(x, y_l) \right) \right]$$

  한 프롬프트의 $\binom{K}{2}$개 비교를 한 배치로 묶는 것이 과적합 방지의 핵심 디테일이다.

- **3단계 — PPO**: 31k API 프롬프트에서 RM 보상을 최대화하되, SFT 정책에서 너무 멀어지지 않도록 토큰별 KL 벌점을 건다:

$$\text{objective}(\phi) = \mathbb{E}_{(x,y) \sim \pi_\phi^{RL}} \left[ r_\theta(x, y) - \beta \log \frac{\pi_\phi^{RL}(y \mid x)}{\pi^{SFT}(y \mid x)} \right]$$

  여기에 사전학습 분포의 LM 그래디언트를 $\gamma$ 계수로 섞은 것이 **PPO-ptx** — 정렬로 인한 공개 벤치마크 성능 하락(정렬세, alignment tax)을 상쇄하는 장치로, KL 계수를 키우는 것보다 효과적이었다.

- **라벨러 운영**: Upwork/ScaleAI에서 ~40명을 스크리닝 테스트(민감 콘텐츠 판별력 등)로 선발. 라벨러 간 일치율 72.6±1.5%. 학습에 참여하지 않은 held-out 라벨러들도 같은 선호 순위를 보여, 특정 라벨러 취향에 과적합된 것이 아님을 확인했다.

## 주요 결과

- **선호 평가**: 175B InstructGPT는 175B GPT-3 대비 **85±3%**, few-shot GPT-3 대비 71±4%로 선호. 1.3B InstructGPT조차 175B GPT-3보다 선호 — 정렬이 스케일 100배보다 값지다.
- **정직성**: TruthfulQA에서 진실한 답변이 약 2배, closed-domain 환각률 41%→**21%**.
- **무해성**: respectful 프롬프트 조건에서 RealToxicityPrompts 독성 출력 ~25% 감소. 단, 사회적 편향(Winogender, CrowS-Pairs)은 개선 없음.
- **일반화**: RLHF 데이터에 1% 미만으로 등장하는 비영어 지시와 코드 관련 지시도 따른다 — 정렬이 태스크 암기가 아니라 "지시를 따른다"는 메타 능력으로 일반화된다는 신호.
- **비용**: SFT 4.9, PPO-ptx 60 petaflops/s-days — GPT-3 사전학습(3,640)의 2% 미만. **정렬은 스케일링보다 압도적으로 싸다.**
- 한계도 명시적이다: 여전히 사실을 지어내고, 유해 지시를 직접 받으면 따르며, 거짓 전제를 받아들이고, 과도하게 얼버무린다. 40명의 영어권 라벨러가 "인간의 선호"를 대표할 수 없다는 문제도 논의한다.

## 계보에서의 위치

[GPT-3](/papers/gpt-3/)가 남긴 "능력은 있는데 의도를 안 따른다"는 문제를, [PPO](/papers/ppo/)를 언어 생성에 이식한 RLHF로 푼 논문이다(보상 = 학습된 인간 선호 모델, KL 벌점으로 분포 붕괴 방지). SFT→RM→PPO 3단계는 이후 ChatGPT, Claude, Llama-chat 등 사실상 모든 상용 어시스턴트의 표준 파이프라인이 되었고, "helpful/honest/harmless"라는 프레임과 정렬세 개념도 이 논문이 보급했다. 이후 연구는 이 파이프라인의 각 단계를 대체하는 방향 — RM 없이 선호를 직접 최적화(DPO), 인간 피드백을 AI 피드백으로(RLAIF/Constitutional AI) — 으로 전개된다.
