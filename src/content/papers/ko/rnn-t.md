---
title: "RNN-T: CTC에 언어 모델을 심다 — 스트리밍 ASR의 기본형"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "머신 러닝", "RNN-T", "음성 인식", "LSTM"]
paper: "Sequence Transduction with Recurrent Neural Networks"
paperUrl: "https://arxiv.org/abs/1211.3711"
authors: "Alex Graves"
venue: "ICML Representation Learning Workshop"
year: 2012
references: ["ctc", "lstm"]
description: CTC의 두 한계 — 출력 간 조건부 독립 가정과 출력 길이 ≤ 입력 길이 제약 — 를 해결하는 RNN Transducer를 제안한다. 음향을 읽는 transcription 망과 이전 출력을 읽는 자기회귀 prediction 망을 (t, u) 격자 위에서 결합하고, forward-backward로 모든 정렬의 우도를 정확히 계산한다. TIMIT에서 CTC를 넘었고, 훗날 스트리밍 음성 인식의 표준 프레임이 된다.
---

## 한 줄 요약

[CTC](/papers/ctc/)의 출력은 입력이 주어지면 서로 **조건부 독립**이다 — 내장 언어 모델이 없어서, "이전에 무엇을 출력했는가"를 반영하지 못한다. RNN Transducer는 여기에 두 번째 망을 더한다: 음향을 읽는 **transcription 망**($f_t$)과 이전 출력 라벨만 읽는 자기회귀 **prediction 망**($g_u$, 사실상 내장 LM)을 $(t, u)$ 격자 위에서 결합하고, CTC처럼 모든 정렬에 대해 합산한다. 음향 모델과 언어 모델을 하나의 미분 가능한 목적함수로 **공동 학습**하는 최초의 프레임이자, 10년 뒤 모든 온디바이스 스트리밍 ASR의 뼈대가 되는 구조다.

## 핵심 기여

- **두 망의 결합**: transcription 망(양방향 [LSTM](/papers/lstm/))이 $\mathbf{f} = (f_1, \dots, f_T)$를, prediction 망(단방향 LSTM, 입력은 $\varnothing, y_1, \dots, y_U$)이 $\mathbf{g} = (g_0, \dots, g_U)$를 만들고, 격자점 $(t, u)$마다 두 벡터를 로그 공간에서 더해 다음 기호 분포를 정의한다.

$$h(k, t, u) = \exp\!\left( f_t^k + g_u^k \right), \qquad \Pr(k \mid t, u) = \frac{h(k, t, u)}{\sum_{k'} h(k', t, u)}$$

  null 기호 $\varnothing$는 "이 프레임에서는 출력하지 않고 다음 프레임으로"를 뜻한다 — CTC의 blank가 시간축 전진과 출력 억제를 겸했다면, 여기서는 **시간축($t$) 전진과 출력축($u$) 전진이 격자에서 분리**된다. 덕분에 한 프레임에서 여러 라벨을 출력할 수 있어 출력이 입력보다 길어도 된다(TTS 같은 태스크까지 커버하는 일반성).

- **격자 위의 forward-backward**: $\alpha(t, u) = \alpha(t{-}1, u)\varnothing(t{-}1, u) + \alpha(t, u{-}1) y(t, u{-}1)$ 재귀(및 대응하는 $\beta$)로 모든 정렬 경로의 우도 $\Pr(\mathbf{y}|\mathbf{x}) = \alpha(T, U)\varnothing(T, U)$를 정확히 계산한다 — CTC의 동적 계획법이 1차원 확장 라벨열에서 2차원 격자로 일반화된 것. 그래디언트도 $\alpha\beta$ 곱으로 닫힌 형태로 떨어진다.

- **디코딩**: 길이 정규화된 로그 확률의 beam search. prediction 망이 자기회귀라 디코딩 중에 "지금까지 출력한 것"이 자연스럽게 반영된다.

## 주요 결과

- TIMIT 음소 인식 (261k 가중치의 소형 모델): prediction 망 단독(순수 LM) PER 72.9% / **CTC 25.5% / Transducer 23.2%** — 같은 급 모델에서 CTC를 명확히 넘었고, 당시 TIMIT 최저 기록권. 내장 LM의 기여가 수치로 확인된다.

## 계보에서의 위치

발표 당시보다 훗날이 큰 논문이다. transcription 망은 **인코더**로, prediction 망은 **디코더의 원형**으로 읽히고 — 어텐션 기반 seq2seq([Bahdanau](/papers/bahdanau-attention/), LAS)와 비교하면 RNN-T는 정렬을 어텐션이 아니라 **단조로운 격자**로 제약한 형태다. 이 단조성이 결정적 실용 가치를 갖는다: 인코더가 프레임을 받는 즉시 출력할 수 있어 **스트리밍**이 자연스럽다. 그래서 2019년 이후 Google을 비롯한 온디바이스·실시간 ASR이 전부 RNN-T 프레임으로 수렴했고, [Conformer](/papers/conformer/)도 RNN-T 디코더 위에서 SOTA를 찍었다. [CTC](/papers/ctc/) → RNN-T → 어텐션 인코더-디코더([Whisper](/papers/whisper/))로 이어지는 "정렬을 다루는 세 가지 방법"의 가운데 항이다.
