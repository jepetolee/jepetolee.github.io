---
title: "Dreamer: 상상 속에서 정책을 학습하다"
date: 2022-10-12
category: 강화학습
subcategory: World Models
tags: ["강화학습", "월드 모델", "인공신경망", "ICLR", "Google DeepMind", "Dreamer", "RSSM", "World Model"]
paper: "Dream to Control: Learning Behaviors by Latent Imagination"
paperUrl: "https://arxiv.org/abs/1912.01603"
authors: "Danijar Hafner et al."
venue: "ICLR"
year: 2020
references: ["planet", "world-models"]
description: PlaNet의 RSSM 위에서 actor-critic을 잠재 상상(imagination) 롤아웃으로 학습해, 계획 비용 없이 높은 표본 효율을 달성한 모델.
---

## 한 줄 요약

Dreamer는 환경의 동역학을 **잠재 공간(latent space)** 에서 학습하는 월드 모델로, 상상(imagination) 속에서 정책을 학습해 표본 효율을 끌어올린다.

## PlaNet에서 무엇이 바뀌었나

- [PlaNet](/papers/planet/)의 RSSM 동역학을 그대로 쓰되, 매 스텝 CEM 계획 대신 **actor-critic**을 도입한다.
- 잠재 상태에서 미래를 상상으로 펼치고, value를 통해 그래디언트를 흘려 정책을 학습한다.
- 덕분에 추론 시 계획 탐색이 사라져 훨씬 빠르고 표본 효율적이다.

## RSSM 복습

- 결정적 상태: $h_t = f(h_{t-1}, s_{t-1}, a_{t-1})$
- 확률적 상태: $s_t \sim p(s_t \mid h_t)$

장기 의존성(결정적 경로)과 불확실성(확률적 경로)을 동시에 다룬다.

## 직접 적용하며 느낀 점

- 표본 효율이 중요한 환경(실거래 데이터가 제한적)에서 상상 기반 학습이 유리하다.
- 다만 Atari 대비 코인 트레이딩 환경에서는 비정상성(non-stationarity) 때문에 취약했다.

> 다음 단계: 이산 잠재 변수와 KL 밸런싱을 도입해 Atari를 정복한 [DreamerV2](/papers/dreamer-v2/).
