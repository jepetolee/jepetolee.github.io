---
title: "Dreamer와 RSSM 핵심 메모"
date: 2022-10-12
tags: ["강화학습", "Dreamer", "RSSM", "World Model"]
source: "Dream to Control (Hafner et al., 2019)"
sourceUrl: "https://arxiv.org/abs/1912.01603"
description: 월드 모델 기반 강화학습 Dreamer의 RSSM 구조와 잠재 상태 학습을 짧게 정리한 노트.
---

## 한 줄 요약

Dreamer는 환경의 동역학을 **잠재 공간(latent space)** 에서 학습하는 월드 모델로, 상상(imagination) 속에서 정책을 학습해 표본 효율을 끌어올린다.

## RSSM (Recurrent State Space Model)

잠재 상태를 결정적 요소 $h_t$ 와 확률적 요소 $s_t$ 로 분리한다.

- 결정적 상태: $h_t = f(h_{t-1}, s_{t-1}, a_{t-1})$
- 확률적 상태: $s_t \sim p(s_t \mid h_t)$

이 구조 덕분에 장기 의존성(결정적 경로)과 불확실성(확률적 경로)을 동시에 다룰 수 있다.

## 왜 트레이딩에 끌렸나

- 표본 효율이 중요한 환경(실거래 데이터가 제한적)에서 상상 기반 학습이 유리하다.
- 다만 Atari 대비 코인 트레이딩 환경에서는 비정상성(non-stationarity) 때문에 취약했다.

> 다음 단계: Transformer 기반 동역학 모델(TSSM 계열)과의 비교 실험.
