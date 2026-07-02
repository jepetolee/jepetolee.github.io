---
title: "Transformer: 순환을 버리고 어텐션만 남기다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "NeurIPS", "Google Research", "Transformer", "어텐션", "기계 번역"]
paper: "Attention Is All You Need"
paperUrl: "https://arxiv.org/abs/1706.03762"
authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin"
venue: "NeurIPS"
year: 2017
references: ["seq2seq", "bahdanau-attention"]
description: 순환도 합성곱도 없이 어텐션만으로 구성한 인코더-디코더 아키텍처를 제안한다. Scaled dot-product attention과 multi-head attention으로 임의 위치 간 경로 길이를 O(1)로 줄이고 완전 병렬 학습을 가능하게 해, WMT14 En-De 28.4 BLEU를 훨씬 적은 학습 비용으로 달성했다.
---

## 한 줄 요약

RNN의 근본 제약은 은닉 상태 $h_t$가 $h_{t-1}$의 함수라는 것 — 시퀀스 내부의 병렬화가 원천적으로 불가능하고, 먼 위치 간 신호가 $O(n)$ 스텝을 거쳐야 한다. Transformer는 순환과 합성곱을 모두 버리고 어텐션만으로 인코더-디코더를 구성해, 임의 두 위치 사이의 경로를 $O(1)$로 만들고 학습을 완전히 병렬화했다. 결과: 더 좋은 번역 품질을 훨씬 적은 학습 비용으로.

## 핵심 기여

- **Scaled dot-product attention**: 쿼리-키 내적을 $\sqrt{d_k}$로 나눠 softmax를 통과시킨 가중치로 밸류를 합산한다.

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

  Bahdanau의 additive attention과 이론 복잡도는 같지만 행렬곱으로 구현되어 실제로는 훨씬 빠르다. $\sqrt{d_k}$ 스케일링은 $d_k$가 클 때 내적의 분산이 커져 softmax가 그래디언트가 소멸하는 포화 영역으로 밀리는 것을 막는 장치다.

- **Multi-head attention**: 어텐션을 $d_{model}$ 전체에서 한 번 하는 대신, 서로 다른 학습된 projection으로 $h=8$개의 부분공간($d_k = d_v = d_{model}/h = 64$)에서 병렬로 수행하고 이어붙인다.

$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)W^O, \quad \text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

  총 계산량은 single-head와 같게 유지하면서 "서로 다른 표현 부분공간의 정보를 동시에 참조"할 수 있다. 단일 헤드는 8헤드 대비 BLEU가 0.9 낮다(ablation).

- **어텐션의 세 가지 용법**: (1) 인코더 self-attention, (2) 디코더의 **masked** self-attention(위치 $i$가 $i$ 이전 출력만 보도록 마스킹 — 자기회귀 성질 보존), (3) 디코더 쿼리가 인코더 출력을 참조하는 encoder-decoder attention. 기존 seq2seq+어텐션의 역할 분담이 세 가지 어텐션으로 재구성된 것.

- **아키텍처**: 인코더/디코더 각 $N=6$층, $d_{model}=512$. 모든 서브층에 residual connection + LayerNorm ($\text{LayerNorm}(x + \text{Sublayer}(x))$). 각 층에 위치별 FFN:

$$\text{FFN}(x) = \max(0,\ xW_1 + b_1)W_2 + b_2, \quad d_{ff} = 2048$$

  입력/출력 임베딩과 pre-softmax 선형변환은 가중치를 공유하고 임베딩에 $\sqrt{d_{model}}$을 곱한다.

- **사인파 위치 인코딩**: 순환이 없으므로 위치 정보를 따로 주입해야 한다.

$$PE_{(pos, 2i)} = \sin(pos/10000^{2i/d_{model}}), \quad PE_{(pos, 2i+1)} = \cos(pos/10000^{2i/d_{model}})$$

  $PE_{pos+k}$가 $PE_{pos}$의 선형 함수가 되어 상대 위치 참조 학습이 쉬울 것이라는 가설. 학습형 위치 임베딩과 성능이 거의 같았지만(25.7 vs 25.8) 학습보다 긴 시퀀스로의 외삽 가능성 때문에 사인파를 택했다.

- **왜 self-attention인가**: 층당 복잡도 / 순차 연산 / 최대 경로 길이 비교 — self-attention은 $O(n^2 \cdot d)$ / $O(1)$ / $O(1)$, 순환은 $O(n \cdot d^2)$ / $O(n)$ / $O(n)$. BPE/wordpiece 문장은 대개 $n < d$이므로 계산량에서도 RNN보다 유리하고, 장거리 의존성 학습에 결정적인 경로 길이에서 압도한다.

## 학습과 결과

- WMT'14 En-De 4.5M쌍(BPE 37k) / En-Fr 36M쌍(wordpiece 32k). Adam($\beta_2=0.98$)에 warmup 4000스텝 후 역제곱근 감쇠하는 스케줄:

$$lrate = d_{model}^{-0.5} \cdot \min(step^{-0.5},\ step \cdot warmup^{-1.5})$$

  dropout 0.1, label smoothing 0.1(perplexity는 나빠지지만 BLEU는 좋아진다).
- Base 모델은 8×P100에서 **12시간**(100k스텝), Big 모델은 3.5일(300k스텝).
- En→De **28.4 BLEU** — 기존 최고 앙상블 대비 +2.0 이상. En→Fr **41.8 BLEU** — 이전 SOTA의 1/4 학습 비용으로.
- Penn Treebank 구문 분석에 거의 튜닝 없이 적용해 F1 91.3(판별)/92.7(준지도) — 태스크 특화 구조 없이도 일반화됨을 보였다.

## 계보에서의 위치

[Bahdanau attention](/papers/bahdanau-attention/)이 "디코더가 인코더를 검색한다"는 보조 메커니즘으로서의 어텐션을 만들었다면, 이 논문은 어텐션을 유일한 계산 원리로 승격시켰다. [Seq2Seq](/papers/seq2seq/)의 인코더-디코더 골격은 유지하면서 내부를 전부 어텐션으로 갈아 끼운 셈이다. 학습의 완전 병렬화는 단순한 공학적 개선이 아니라 이후 모든 스케일링의 전제 조건이 됐다: GPT 계열은 이 아키텍처의 디코더만, BERT는 인코더만 떼어내 사전학습 시대를 열었고, 오늘날 LLM의 아키텍처 논의는 여전히 이 논문이 정의한 부품들(MHA, FFN, residual+LN, 위치 인코딩)의 변주다.
