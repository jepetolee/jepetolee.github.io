---
title: "Scaling Laws: 언어 모델 성능은 멱법칙을 따른다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "머신 러닝", "OpenAI", "스케일링 법칙", "언어 모델"]
paper: "Scaling Laws for Neural Language Models"
paperUrl: "https://arxiv.org/abs/2001.08361"
authors: "Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, Dario Amodei"
venue: "arXiv"
year: 2020
references: ["gpt-2"]
description: 언어 모델의 교차엔트로피 손실이 모델 크기, 데이터 크기, 학습 연산량 각각에 대해 6~8 자릿수에 걸친 멱법칙을 따름을 실증한다. 아키텍처 모양은 거의 무관하며, 고정된 연산 예산에서는 아주 큰 모델을 수렴 전에 멈추는 것이 최적이라는 compute-optimal 학습 원칙을 도출했다.
---

## 한 줄 요약

Transformer 언어 모델의 손실은 모델 크기 $N$, 데이터 크기 $D$, 학습 연산량 $C$ 각각에 대해 **6~8 자릿수에 걸친 매끈한 멱법칙**을 따르고, 깊이/너비/헤드 수 같은 아키텍처 모양은 거의 무관하다. 따름정리가 더 충격적이다: 고정된 연산 예산에서는 **아주 큰 모델을 만들어 수렴 훨씬 전에 멈추는 것**이 최적이다 — "수렴까지 학습"은 연산 낭비다.

## 핵심 기여

- **세 개의 멱법칙**: 다른 요인이 병목이 아닐 때,

$$L(N) = (N_c/N)^{\alpha_N}, \quad \alpha_N \approx 0.076, \ N_c \approx 8.8 \times 10^{13}$$

$$L(D) = (D_c/D)^{\alpha_D}, \quad \alpha_D \approx 0.095, \ D_c \approx 5.4 \times 10^{13}$$

$$L(C_{\min}) = (C_c^{\min}/C_{\min})^{\alpha_C^{\min}}, \quad \alpha_C^{\min} \approx 0.050$$

  여기서 $N$은 **임베딩을 제외한** 파라미터 수다 — 임베딩을 포함하면 깊이별 추세가 갈라지지만, 제외하면 단일 곡선으로 수렴한다.

- **모양은 거의 무관**: $N$을 고정하면 층수/헤드 수/FFN 폭에 대한 의존이 극히 약하다 — 종횡비를 40배 바꿔도 손실 변화는 ~3%. "아키텍처 튜닝보다 스케일"이라는 이 논문의 슬로건이 여기서 나온다.

- **과적합의 보편 법칙**: $N$과 $D$를 동시에 움직이면

$$L(N, D) = \left[ \left(\frac{N_c}{N}\right)^{\alpha_N/\alpha_D} + \frac{D_c}{D} \right]^{\alpha_D}$$

  과적합 정도는 $N^{0.74}/D$ 비율이 지배한다: 모델을 8배 키울 때 데이터는 약 5배만 키우면 벌점이 없다.

- **학습 곡선의 법칙**: 데이터가 충분할 때 스텝 수 $S$에 대해 $L(N, S) = (N_c/N)^{\alpha_N} + (S_c/S_{\min})^{\alpha_S}$, $\alpha_S \approx 0.76$. 학습 곡선의 초반만 보고 최종 손실을 외삽할 수 있다는 뜻이다.

- **Compute-optimal 할당**: 연산 예산 $C$가 주어지면 최적 배분은 $N \propto C^{0.73}$, 배치 $B \propto C^{0.24}$, 스텝 $S \propto C^{0.03}$ — 예산 증가분의 대부분을 **모델 크기**에 쓰고, 스텝은 거의 늘리지 않는다. 큰 모델이 훨씬 표본 효율적이므로(같은 손실에 더 적은 토큰), 수렴은 비효율이고 큰 모델의 조기 종료가 정답이 된다. critical batch size는 손실만의 함수 $B_{crit}(L) = B_*/L^{1/\alpha_B}$ ($\alpha_B \approx 0.21$)로 잡힌다.

- **법칙들의 모순과 추측**: compute-optimal 궤적은 $D \propto C^{0.27}$을 요구하지만 과적합 회피는 $D \propto C^{0.54}$를 요구한다 — 두 곡선은 $C^* \sim 10^4$ PF-days, $N^* \sim 10^{12}$, $L^* \approx 1.7$ nats/token 근처에서 교차하며, 저자들은 이 지점이 자연어의 토큰당 엔트로피(성능의 천장)일 수 있다고 추측한다(수치는 매우 불확실하다고 단서).

## 계보에서의 위치

[GPT-2](/papers/gpt-2/)에서 경험적으로 관찰된 "키우면 좋아진다"를 정량 법칙으로 승격시켜, GPT-3(공저자 다수가 겹친다)의 175B 투자를 정당화한 이론적 배경이다. 다만 "스텝은 거의 늘리지 마라"는 처방은 이후 DeepMind의 Chinchilla(2022)가 학습률 스케줄을 통제한 재실험으로 뒤집는다 — compute-optimal은 $N$과 $D$를 **같은 비율로** 키우는 것이며, GPT-3급 모델들은 데이터 대비 과대했다는 것. 그럼에도 "손실은 스케일의 매끈한 멱법칙"이라는 이 논문의 프레임 자체는 살아남아, 오늘날 모든 프론티어 모델의 사전학습 예산 설계가 이 논문이 만든 언어(스케일링 법칙, compute-optimal frontier) 위에서 이루어진다. 매끈한 손실 곡선이 능력의 질적 도약(창발)을 가릴 수 있다는 저자들의 경고도 이후 창발 능력 논쟁으로 이어졌다.
