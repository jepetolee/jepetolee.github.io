---
title: "Bahdanau Attention: 고정 벡터 병목을 정렬 학습으로 풀다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 시퀀스 모델링
tags: ["자연어 처리", "ICLR", "어텐션", "기계 번역", "RNN"]
paper: "Neural Machine Translation by Jointly Learning to Align and Translate"
paperUrl: "https://arxiv.org/abs/1409.0473"
authors: "Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio"
venue: "ICLR"
year: 2015
references: ["seq2seq"]
description: 인코더-디코더의 고정 길이 벡터 병목을 지적하고, 디코더가 매 출력 단어마다 소스 문장의 관련 위치를 미분 가능한 soft alignment로 골라 읽는 어텐션 메커니즘을 제안한다. 긴 문장에서의 성능 붕괴를 해소하고 번역과 정렬을 하나의 목적함수로 동시에 학습한다.
---

## 한 줄 요약

인코더-디코더 번역의 진짜 병목은 "소스 문장의 모든 정보를 고정 길이 벡터 하나에 압축해야 한다"는 구조에 있다. 이 논문은 디코더가 출력 단어를 하나 생성할 때마다 소스 문장의 annotation들 중 관련 있는 위치를 **soft하게 검색**해서 읽도록 만들었다 — 정렬(alignment)을 잠재변수가 아니라 미분 가능한 가중합으로 정의해 번역과 함께 end-to-end로 학습하는, 이후 "어텐션"이라 불리게 될 메커니즘의 원형이다.

## 핵심 기여

- **양방향 인코더 + annotation**: 인코더는 양방향 GRU로 소스를 읽고, 각 위치 $j$의 순방향/역방향 은닉 상태를 이어붙인 annotation $h_j = [\overrightarrow{h}_j; \overleftarrow{h}_j]$를 만든다. 문장 전체가 벡터 하나가 아니라 **가변 길이의 벡터 시퀀스**로 표현된다.

- **컨텍스트 벡터와 정렬 가중치**: 목표 위치 $i$마다 컨텍스트 벡터를 annotation의 가중합으로 만든다.

$$c_i = \sum_{j=1}^{T_x} \alpha_{ij} h_j, \qquad \alpha_{ij} = \frac{\exp(e_{ij})}{\sum_{k=1}^{T_x} \exp(e_{ik})}$$

  정렬 점수 $e_{ij}$는 직전 디코더 상태와 annotation을 입력으로 받는 작은 feedforward 망(additive attention)으로 계산하고, 전체 시스템과 **함께** 학습된다:

$$e_{ij} = a(s_{i-1}, h_j) = v_a^T \tanh(W_a s_{i-1} + U_a h_j)$$

- **디코더**: 상태 갱신과 출력 분포가 모두 $c_i$를 조건으로 받는다 — $s_i = f(s_{i-1}, y_{i-1}, c_i)$, $p(y_i \mid y_{<i}, x) = g(y_{i-1}, s_i, c_i)$. 전통적 SMT의 정렬과 달리 잠재변수가 아니라 **soft** 정렬이므로 그래디언트가 정렬 모델을 그대로 통과한다. $\alpha_{ij}$는 확률적 "기대 annotation"으로 읽을 수 있고, 디코더 입장에선 매 스텝 소스에 대한 어텐션을 새로 배분하는 셈이다.

- **학습 설정**: WMT'14 En-Fr(348M 단어로 축소), 어휘 30k, 인코더/디코더 은닉 1000, 임베딩 620차원, maxout 출력층 500, Adadelta + 배치 80 SGD로 모델당 약 5일. 학습 문장 길이 30/50 단어의 두 조건으로 베이스라인 RNNencdec(고정 벡터 인코더-디코더)과 비교.

## 주요 결과

- BLEU (전체 / UNK 없는 문장): RNNencdec-50 17.82 / 26.71 vs **RNNsearch-50 26.75 / 34.16**, 연장 학습한 RNNsearch-50★은 28.45 / **36.15** — UNK 없는 조건에서는 구문 기반 Moses(33.30 / 35.63)를 넘는다.
- 문장 길이 분석이 핵심 증거다: RNNencdec은 30단어를 넘으면 성능이 급락하지만 RNNsearch-50은 50단어 이상에서도 **성능 저하가 없다**. 고정 벡터 병목 가설이 정확했다는 뜻.
- 어텐션 행렬 시각화는 대체로 단조로운(대각선) 정렬 속에서 영-불 형용사-명사 어순 뒤집기 같은 비단조 재배열을 정확히 처리하고, "the man" → "l' homme"처럼 길이가 다른 구도 NULL 매핑 없이 자연스럽게 다룬다.

## 계보에서의 위치

[Seq2Seq](/papers/seq2seq/)가 문장 전체를 벡터 하나로 압축했다면(그리고 입력 뒤집기 같은 트릭으로 병목을 완화했다면), 이 논문은 병목 자체를 제거했다. "매 스텝, 쿼리(디코더 상태)로 키(annotation)들을 스코어링해 밸류의 가중합을 읽는다"는 구도는 이후 Luong의 곱셈형 어텐션을 거쳐, "그럼 순환 없이 어텐션만으로 다 하면 되지 않나"라는 Transformer의 질문으로 직행한다. Transformer의 scaled dot-product attention은 이 논문의 additive attention을 내적으로 바꾼 것이고, "jointly learning to align and translate"라는 제목의 정신 — 정렬을 별도 시스템이 아니라 미분 가능한 부품으로 — 은 현대 LLM의 모든 어텐션 층에 남아 있다.
