---
title: "i-vector: 발화 하나를 벡터 하나로 — 딥러닝 이전의 화자 표현"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 화자 인식
tags: ["ASR", "머신 러닝", "i-vector", "화자 인식", "요인 분석"]
paper: "Front-End Factor Analysis for Speaker Verification"
paperUrl: "https://doi.org/10.1109/TASL.2010.2064307"
authors: "Najim Dehak, Patrick J. Kenny, Réda Dehak, Pierre Dumouchel, Pierre Ouellet"
venue: "IEEE Transactions on Audio, Speech, and Language Processing"
year: 2011
references: []
description: 화자 공간과 채널 공간을 따로 모델링하던 JFA 대신, 둘을 구분하지 않는 단일 저차원 총변동(total variability) 공간을 요인 분석으로 정의하고 발화를 그 공간의 잠재 벡터(i-vector)로 요약한다. 채널 보상은 저차원에서 WCCN/LDA로 처리하고 코사인 거리만으로 스코어링해, 등록 과정 없는 단순한 시스템으로 NIST SRE에서 JFA를 넘어섰다.
---

## 한 줄 요약

딥러닝 이전 화자 인식의 정점이던 JFA는 GMM 슈퍼벡터를 화자 공간($Vy$)과 채널 공간($Ux$)으로 분해했다. 그런데 저자들의 선행 실험에서 **채널 요인에도 화자 정보가 새어 들어간다**는 것이 드러났고 — 그렇다면 애초에 둘을 나누지 말자는 것이 이 논문이다: 슈퍼벡터를 단일 저차원 **총변동 공간**으로 사영해 발화 하나를 400차 벡터 하나(**i-vector**)로 요약하고, 화자/채널 분리는 그 저차원 공간에서 LDA·WCCN으로 나중에 처리한다. "발화 → 고정 차원 벡터 → 코사인 거리"라는, 이후 신경망 임베딩 시대까지 이어지는 문제 형식을 확정한 논문이다.

## 핵심 기여

- **JFA에서 총변동으로**: JFA의 분해 $M = m + Vy + Ux + Dz$를 버리고, 화자·채널 구분 없는 단일 저계수 행렬 $T$로 대체한다.

$$M = m + Tw$$

  $m$은 UBM(2048 성분 GMM) 평균 슈퍼벡터, $w \sim \mathcal{N}(0, I)$가 총요인(total factors), 즉 i-vector다. $T$의 학습은 고유음성(eigenvoice) 학습과 같되 한 가지가 다르다 — **한 화자의 발화들을 전부 서로 다른 화자가 만든 것처럼 취급**한다(화자별로 묶으면 화자 공간이 되고, 발화별로 흩으면 총변동 공간이 된다).

- **i-vector 추출은 닫힌 형태**: UBM에 대한 Baum-Welch 통계량 $N_c = \sum_t P(c|y_t)$, $\tilde{F}_c = \sum_t P(c|y_t)(y_t - m_c)$를 모으면 i-vector는 잠재변수 $w$의 사후 평균으로 바로 나온다.

$$w = \left( I + T^t \Sigma^{-1} N(u) T \right)^{-1} T^t \Sigma^{-1} \tilde{F}(u)$$

  **요인 분석이 특징 추출기 역할을 한다** — 논문 제목(front-end factor analysis)의 의미다.

- **채널 보상은 저차원에서**: 슈퍼벡터 공간(수만 차원)이 아니라 400차 i-vector 공간에서 채널을 지운다 — 화자 간 분산을 최대화하는 **LDA**(200차로 축소), 화자 내 공분산의 역으로 코사인 커널을 정규화하는 **WCCN**, 그리고 NAP를 비교했고, **LDA→WCCN 조합**이 최선이었다.

- **코사인 스코어링 — 등록의 소멸**: 판정은 두 i-vector의 코사인 거리 하나로 끝난다.

$$\text{score}(w_{target}, w_{test}) = \frac{\langle w_{target}, w_{test} \rangle}{\|w_{target}\| \|w_{test}\|} \gtrless \theta$$

  SVM도, JFA식 우도 적분도, 별도의 화자 등록 절차도 필요 없다 — 타깃과 테스트가 정확히 같은 방식으로 처리된다. 크기(norm)에는 화자 외 정보(세션·채널)가 실려 있어 각도만 보는 것이 강건하다는 관찰도 함께.

## 주요 결과

- NIST SRE 2008 core 남성 영어 조건에서 **EER 1.12% / MinDCF 0.0094** — 당시 최고 수준. NIST 2006 여성 영어에서 LDA(200)+WCCN 조합이 JFA 스코어링과 대등하거나 나은 EER/DCF를 더 단순한 파이프라인으로 달성(all-trials 2.72% vs JFA 3.84%).
- 10s-10s 단발화 조건에서 고전 JFA 대비 **EER 절대 4% 개선** — 짧은 발화일수록 단순한 표현이 강건하다.
- 입력은 60차 특징(19 MFCC + 로그 에너지 + Δ + ΔΔ) — [신호처리 근간](/insight/audio-signal-fundamentals/)에서 정리한 GMM 시대 표준 그대로다.

## 계보에서의 위치

2011년부터 [x-vector](/papers/x-vector/)(2018)까지 화자 인식의 표준이었고, "i-vector"는 사실상 화자 표현의 대명사였다. 이 논문의 형식적 유산이 내용보다 크다 — **발화를 고정 차원 벡터로 요약하고, 임베딩 공간에서 채널을 보상하고, 코사인/PLDA로 스코어링한다**는 3단 구도는 신경망 시대에 부품만 교체된 채 그대로 살아남았다(추출기: FA→TDNN, 보상: LDA/WCCN→학습된 불변성+증강, 스코어: 코사인/PLDA는 그대로). [화자 인식 글](/insight/speaker-recognition/)의 계보가 여기서 시작하는 이유이고, x-vector 논문이 증명한 것도 정확히 "지도학습 + 증강이 비지도 요인 분석을 이긴다"는 이 틀 안에서의 교체였다.
