---
title: "ELMo: 단어 벡터를 문맥의 함수로 바꾸다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "NAACL", "ELMo", "단어 임베딩", "사전학습", "LSTM"]
paper: "Deep Contextualized Word Representations"
paperUrl: "https://arxiv.org/abs/1802.05365"
authors: "Matthew E. Peters, Mark Neumann, Mohit Iyyer, Matt Gardner, Christopher Clark, Kenton Lee, Luke Zettlemoyer"
venue: "NAACL"
year: 2018
references: ["lstm", "word2vec", "glove"]
description: 대규모 코퍼스로 학습한 양방향 LSTM 언어 모델의 내부 상태들을 태스크별 가중합으로 결합해, 단어 하나에 고정 벡터 하나가 아니라 문장 전체의 함수인 문맥화된 표현을 부여한다. 기존 모델에 이 표현을 이어붙이는 것만으로 QA, NLI, SRL 등 6개 태스크에서 일제히 SOTA를 경신했다.
---

## 한 줄 요약

word2vec/GloVe의 근본 한계는 "play"가 어떤 문장에 있든 같은 벡터라는 것 — 다의성과 문맥에 따른 용법 변화를 담을 수 없다. ELMo는 대규모 코퍼스로 사전학습한 **양방향 LSTM 언어 모델(biLM)의 모든 층의 내부 상태**를 태스크별 가중합으로 결합한 표현을 각 토큰에 부여한다. 단어 벡터가 "타입당 하나"에서 "**입력 문장 전체의 함수**"로 바뀌는 순간이고, 이 벡터를 기존 모델에 이어붙이기만 해도 6개 태스크의 SOTA가 일제히 갱신됐다.

## 핵심 기여

- **biLM 사전학습**: 순방향과 역방향 LM의 로그우도를 함께 최대화한다.

$$\sum_{k=1}^{N} \left[ \log p(t_k \mid t_1, \dots, t_{k-1}; \Theta_x, \overrightarrow{\Theta}_{LSTM}, \Theta_s) + \log p(t_k \mid t_{k+1}, \dots, t_N; \Theta_x, \overleftarrow{\Theta}_{LSTM}, \Theta_s) \right]$$

  토큰 임베딩($\Theta_x$)과 softmax($\Theta_s$)는 양방향이 공유하고 LSTM 파라미터만 방향별로 둔다. 구조는 문자 n-gram CNN(2048 필터) → highway 2층 → 512차원 projection을 입력으로 하는 $L=2$층 biLSTM(4096 유닛, 512 projection, residual). 문자 기반 입력이라 OOV가 없다. 1B Word Benchmark에서 학습, perplexity 39.7.

- **ELMo 결합 공식**: 토큰 $k$마다 토큰층($j=0$)과 biLSTM 두 층의 표현, 총 $2L+1$개를 태스크별로 학습되는 softmax 정규화 가중치 $s_j^{task}$와 스칼라 $\gamma^{task}$로 접는다.

$$\text{ELMo}_k^{task} = \gamma^{task} \sum_{j=0}^{L} s_j^{task}\, h_{k,j}^{LM}$$

  마지막 층만 쓰는 것(SQuAD dev F1 84.7)보다 전 층 가중합(85.2)이 좋다 — **층마다 담는 언어 정보가 다르기 때문**이다.

- **다운스트림 통합**: biLM은 얼려두고, 태스크 모델의 입력 임베딩에 $[x_k; \text{ELMo}_k]$로 이어붙인다(일부 태스크는 출력 쪽 $[h_k; \text{ELMo}_k]$에도). ELMo에 dropout 50%와 가중치 L2($\lambda \approx 0.001$)를 건다. 즉 기존 아키텍처를 거의 바꾸지 않는 **feature-based 전이**다.

## 주요 결과

- 6개 태스크 전부에서 단일 모델 SOTA: SQuAD F1 81.1→**85.8**(상대 오류 감소 24.9%), SNLI 88.0→88.7, SRL F1 81.4→**84.6**, 상호참조 67.2→**70.4**, NER 90.15→**92.22**, SST-5 51.4→**54.7**.
- **층별 분업의 증거**: biLM 1층 표현은 POS 태깅에 더 좋고(97.3 vs 96.8), 2층은 어의 중의성 해소(WSD)에 더 좋다(69.0 vs 67.4) — 낮은 층은 구문, 높은 층은 의미. 이 관찰이 "전 층 가중합"의 근거이자, 이후 BERTology의 층별 분석 연구로 이어지는 출발점이다.
- **표본 효율**: SRL에서 ELMo를 쓰면 베이스라인의 최종 성능에 486에폭 대신 10에폭 만에 도달하고, 학습 데이터 1%로 베이스라인의 10% 데이터 성능을 낸다.

## 계보에서의 위치

[Word2Vec](/papers/word2vec/)과 [GloVe](/papers/glove/)의 "타입당 고정 벡터" 패러다임을 [LSTM](/papers/lstm/) 기반 언어 모델의 내부 표현으로 대체한, feature-based 사전학습 시대의 정점이다. "언어 모델링이라는 비지도 목적함수가 구문부터 의미까지 계층적으로 조직된 표현을 공짜로 만들어낸다"는 이 논문의 메시지는 몇 달 뒤 GPT-1(같은 아이디어를 Transformer + fine-tuning으로)과 BERT(양방향성을 마스킹으로 층 전체에)로 즉시 계승·확장된다. ELMo의 양방향성이 두 단방향 LM의 얕은 결합에 그친다는 점이 BERT 논문이 지적하는 정확한 공격 지점이다.
