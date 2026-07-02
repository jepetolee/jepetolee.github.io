---
title: "Word2Vec: 단어의 의미를 벡터 산술로 만들다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 단어 임베딩
tags: ["자연어 처리", "ICLR", "Google Research", "Word2Vec", "단어 임베딩", "Skip-gram"]
paper: "Efficient Estimation of Word Representations in Vector Space"
paperUrl: "https://arxiv.org/abs/1301.3781"
authors: "Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean"
venue: "ICLR Workshop"
year: 2013
references: []
description: 은닉층을 제거한 두 가지 로그-선형 아키텍처(CBOW, Skip-gram)로 대규모 코퍼스에서 단어 벡터를 하루 안에 학습할 수 있음을 보인다. 학습된 벡터는 vector("King") - vector("Man") + vector("Woman") ≈ vector("Queen") 같은 벡터 산술로 의미적·구문적 관계를 포착한다.
---

## 한 줄 요약

단어 벡터를 얻기 위해 굳이 무거운 신경망 언어 모델 전체를 학습할 필요가 없다. 은닉층을 제거한 단순한 로그-선형 모델(CBOW, Skip-gram)만으로도 16억 단어 규모 코퍼스에서 **하루 안에** 고품질 단어 벡터를 학습할 수 있고, 이렇게 얻은 벡터 공간에서는 $\text{vector}(\text{"biggest"}) - \text{vector}(\text{"big"}) + \text{vector}(\text{"small"})$의 최근접 이웃이 "smallest"가 되는 식의 **선형 규칙성**이 나타난다.

## 핵심 기여

- **문제 재정의 — 언어 모델이 아니라 표현이 목표**: 기존 NNLM(Bengio et al.)은 다음 단어 예측을 위해 임베딩과 신경망을 함께 학습했고, 계산량 대부분이 비선형 은닉층에서 나왔다. 이 논문은 "좋은 단어 표현"만이 목표라면 은닉층을 버려도 된다는 관찰에서 출발한다. 모델별 학습 복잡도를 $O(E \times T \times Q)$ (에폭 수 × 토큰 수 × 예시당 연산량) 프레임으로 통일해 비교한다.
  - NNLM: $Q = N \times D + N \times D \times H + H \times V$ — 지배항은 $N \times D \times H$ (계층적 softmax 사용 시).
  - RNNLM: $Q = H \times H + H \times V$ — 지배항은 순환 연결 $H \times H$.

- **CBOW (Continuous Bag-of-Words)**: 주변 문맥(앞 4단어 + 뒤 4단어)의 벡터를 **평균낸 projection**으로 현재 단어를 예측한다. 어순 정보가 사라지므로 bag-of-words지만, 연속 표현을 쓴다는 점이 다르다. 복잡도는

$$Q = N \times D + D \times \log_2 V$$

  로, NNLM의 은닉층 항이 통째로 사라진다.

- **Skip-gram**: 예측 방향을 뒤집어, 현재 단어 하나로 최대 거리 $C$ 이내의 주변 단어들을 예측한다. 멀리 있는 단어일수록 관련성이 낮으므로 $[1, C]$에서 무작위로 뽑은 $R$로 window를 줄여 샘플링 가중치를 준다. 복잡도는

$$Q = C \times (D + D \times \log_2 V)$$

- **계층적 softmax + Huffman 트리**: 어휘 전체 $V$에 대한 softmax 대신 이진 트리 경로로 확률을 계산하되, 트리를 빈도 기반 **Huffman 트리**로 만들면 자주 나오는 단어의 경로가 짧아져 평가 횟수가 $\log_2 V$가 아니라 대략 $\log_2(\text{unigram perplexity}(V))$ 수준이 된다 — 백만 단어 어휘 기준 약 2배 추가 속도 향상. DistBelief 위에서 50~100 replica의 비동기 미니배치 SGD + Adagrad로 분산 학습했다.

- **Semantic-Syntactic Word Relationship 테스트셋**: "좋은 벡터"를 유사도 순위가 아니라 **유추(analogy)** 문제로 평가하는 벤치마크를 새로 만들었다. 의미 질문 8,869개(수도-국가, 통화, 남-여 등 5종) + 구문 질문 10,675개(비교급, 최상급, 과거형, 복수형 등 9종). 평가 방식은 벡터 산술 그 자체다: $X = \text{vector}(\text{"biggest"}) - \text{vector}(\text{"big"}) + \text{vector}(\text{"small"})$을 계산하고 코사인 거리 최근접 단어가 정답과 **정확히 일치**해야 정답 처리(동의어 불인정).

## 주요 결과

- 640차원, 3.2억 단어 코퍼스 동일 조건 비교에서 (의미 / 구문 정확도): RNNLM 9% / 36%, NNLM 23% / 53%, **CBOW 24% / 64%**, **Skip-gram 55% / 59%**. Skip-gram의 의미 관계 포착이 압도적이고, CBOW는 구문 관계에 강하면서 학습이 훨씬 빠르다.
- 정확도는 벡터 차원과 데이터 양을 **함께** 늘려야 오른다 — 한쪽만 늘리면 수확 체감이 빠르게 온다(50차원은 데이터를 24M→783M로 늘려도 13.4%→23.2%에 그침).
- Microsoft Sentence Completion Challenge에서 Skip-gram 단독은 48.0%로 RNNLM(55.4%)보다 낮지만, 둘을 결합하면 **58.9%**로 당시 SOTA — 두 모델이 상보적인 정보를 학습한다는 신호.
- "France - Paris + Italy = Rome", "copper - Cu + zinc = Zn", "Einstein - scientist + Messi = midfielder" 같은 예시들이 벡터 공간의 규칙성이 구문을 넘어 상당히 미묘한 의미 관계까지 미침을 보여준다.

## 계보에서의 위치

이 논문은 "단어 임베딩을 언어 모델 학습의 부산물이 아니라 **그 자체로 목표**로 삼는" 전환점이다. 몇 달 뒤 나온 후속작(NeurIPS 2013)이 negative sampling과 서브샘플링으로 Skip-gram을 한층 더 가속하면서 word2vec 툴킷이 사실상 NLP의 표준 전처리가 되었고, 이에 대한 카운트 기반 진영의 응답이 GloVe다. 이후 ELMo가 "문맥과 무관한 고정 벡터 하나"라는 이 패러다임의 한계를 지적하며 문맥화된 표현으로 넘어가기 전까지, 딥러닝 NLP 파이프라인의 첫 층은 거의 항상 이 논문의 벡터로 초기화되었다.

한 가지 짚어둘 점: 이 논문 자체는 negative sampling을 쓰지 않는다(계층적 softmax만 사용). 흔히 "word2vec"으로 통칭되는 SGNS(Skip-gram with Negative Sampling)는 후속 논문 "Distributed Representations of Words and Phrases and their Compositionality"의 기여다.
