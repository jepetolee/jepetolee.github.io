---
title: "GPT-1: 생성적 사전학습 + 판별적 미세조정이라는 레시피"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "OpenAI", "GPT-1", "사전학습", "언어 모델", "Transformer"]
paper: "Improving Language Understanding by Generative Pre-Training"
paperUrl: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf"
authors: "Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever"
venue: "OpenAI Technical Report"
year: 2018
references: ["transformer", "elmo"]
description: Transformer 디코더를 대규모 비지도 텍스트로 언어 모델링 사전학습한 뒤, 태스크별 아키텍처 대신 입력 변환만으로 각 태스크에 미세조정하는 2단계 프레임을 제시한다. 단일 task-agnostic 모델이 12개 벤치마크 중 9개에서 SOTA를 경신했다.
---

## 한 줄 요약

"대규모 코퍼스로 언어 모델을 사전학습하고(generative pre-training), 라벨 있는 각 태스크에 같은 모델을 미세조정한다(discriminative fine-tuning)" — 오늘날 당연해진 이 2단계 레시피를 Transformer 위에서 확립한 논문이다. 핵심 차별점은 태스크별 아키텍처를 새로 설계하는 대신 **구조화된 입력을 하나의 토큰 시퀀스로 펴는 입력 변환**만으로 전이한다는 것: 단일 모델이 12개 태스크 중 9개에서 SOTA를 갈아치웠다.

## 핵심 기여

- **1단계 — 비지도 사전학습**: 표준 언어 모델링 우도 $L_1(\mathcal{U}) = \sum_i \log P(u_i \mid u_{i-k}, \dots, u_{i-1}; \Theta)$를 12층 **Transformer 디코더**(masked self-attention, 768차원, 12헤드, FFN 3072)로 최대화한다. 원조 Transformer와 달리 학습형 위치 임베딩과 GELU 활성을 쓴다.

$$h_0 = U W_e + W_p, \qquad h_l = \texttt{transformer\_block}(h_{l-1}), \qquad P(u) = \text{softmax}(h_n W_e^T)$$

  데이터는 BooksCorpus(7,000권 이상의 미출간 책) — 1B Word Benchmark와 크기는 비슷하지만 문장 단위로 셔플되지 않아 **장거리 의존성이 살아 있다**는 점을 선택 이유로 명시한다(ELMo와의 데이터 차이). BPE 40k, 512토큰 시퀀스, Adam + cosine 스케줄로 100에폭.

- **2단계 — 지도 미세조정**: 마지막 토큰의 최종 은닉 상태 $h_l^m$에 선형층 하나만 얹어 $P(y \mid x^1, \dots, x^m) = \text{softmax}(h_l^m W_y)$를 학습한다. 언어 모델링을 보조 목적함수로 함께 최적화하면($L_3 = L_2 + \lambda L_1$, $\lambda=0.5$) 일반화와 수렴이 좋아진다. 대부분의 태스크에서 **3에폭이면 충분**했다.

- **태스크별 입력 변환 (traversal-style)**: 새로 추가되는 파라미터가 $W_y$와 구분자 토큰 임베딩뿐이도록, 구조화된 입력을 시퀀스로 편다 — entailment는 `premise $ hypothesis`, 유사도는 두 순서를 각각 처리해 표현을 더하고, 다지선다 QA는 `[문서; 질문; $; 보기]`를 보기마다 처리해 softmax. ELMo처럼 태스크별 모델을 새로 짓는 feature-based 방식과 정확히 대비되는 지점이다.

## 주요 결과

- 12개 데이터셋 중 9개 SOTA: MNLI 82.1, SNLI 89.9, SciTail 88.3, QNLI 88.1, Story Cloze **86.5**(+8.9%p), RACE 59.0(+5.7%p), CoLA **45.4**(이전 최고 35.0), GLUE 전체 **72.8**(이전 최고 68.9). 상당수는 앙상블 상대로 단일 모델이 이긴 결과다.
- **층 전이 분석**: 사전학습된 층을 하나씩 더 전이할수록 MultiNLI 성능이 최대 9%까지 단조 증가 — 모든 층이 유용한 기능을 담고 있다는 뜻.
- **제로샷 분석**: 미세조정 없이 생성 모델의 휴리스틱만으로 태스크를 풀어보면(감성분석은 "very" 뒤에 positive/negative 중 어느 쪽이 높은 확률인지 등) 사전학습이 진행될수록 제로샷 성능이 꾸준히 오르고, LSTM보다 Transformer가 분산이 작다 — **GPT-2의 제로샷 논제가 이미 여기서 싹튼다**.
- Ablation: 사전학습을 빼면 평균 14.8% 하락, Transformer를 2048유닛 LSTM으로 바꾸면 평균 5.6점 하락, 보조 LM 목적함수는 큰 데이터셋에서 도움.

## 계보에서의 위치

[Transformer](/papers/transformer/)의 디코더 절반과 [ELMo](/papers/elmo/)의 "언어 모델 사전학습" 아이디어를 결합하되, feature 추출이 아니라 **모델 전체를 미세조정**하는 쪽으로 방향을 틀었다. 몇 달 뒤 BERT가 같은 프레임에서 인코더+양방향 마스킹으로 판별 태스크 성능을 끌어올리며 정면 대결하게 되고, OpenAI 자신은 제로샷 분석 절을 확장하는 방향 — 미세조정마저 없애는 — 으로 나아가 GPT-2, GPT-3를 만든다. "task-agnostic 모델 하나 + 최소한의 태스크 어댑터"라는 이 논문의 구도는 이후 모든 LLM 전이 학습의 원형이다.
