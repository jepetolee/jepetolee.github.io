---
title: "GloVe: 동시등장 통계를 직접 회귀하는 전역 단어 벡터"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 단어 임베딩
tags: ["자연어 처리", "EMNLP", "GloVe", "단어 임베딩", "Stanford"]
paper: "GloVe: Global Vectors for Word Representation"
paperUrl: "https://aclanthology.org/D14-1162/"
authors: "Jeffrey Pennington, Richard Socher, Christopher D. Manning"
venue: "EMNLP"
year: 2014
references: ["word2vec"]
description: 단어 벡터의 선형 유추 구조가 어디서 오는지 분석하고, 동시등장 확률의 비율을 인코딩하도록 로그-쌍선형 회귀 목적함수를 유도한다. 전역 동시등장 행렬의 0이 아닌 원소만으로 학습해 word analogy 75%로 당시 SOTA를 달성했다.
---

## 한 줄 요약

word2vec의 유추(analogy) 성질은 신기하지만 **왜** 생기는지 불투명했다. GloVe는 "의미는 동시등장 확률의 **비율** $P_{ik}/P_{jk}$에 있다"는 분석에서 출발해, 그 비율을 벡터 차이로 인코딩하는 조건을 만족하는 목적함수를 거의 유일하게 유도한다 — 결과는 전역 동시등장 행렬 $X$에 대한 가중 최소제곱 회귀이며, LSA류(전역 통계 활용)와 skip-gram류(선형 구조)의 장점을 하나로 합친다.

## 핵심 기여

- **동시등장 비율이 의미를 담는다**: $i=\text{ice}$, $j=\text{steam}$일 때 확률 자체가 아니라 비율이 판별적이다. probe 단어 $k=\text{solid}$이면 $P(k|\text{ice})/P(k|\text{steam}) = 8.9$, $k=\text{gas}$면 $8.5\times10^{-2}$, 둘 다와 관련 있거나(water, 1.36) 무관한(fashion, 0.96) 단어는 1 근처 — 비율에서 비판별적 노이즈가 상쇄된다.

- **목적함수의 유도**: 가장 일반적인 형태 $F(w_i, w_j, \tilde{w}_k) = P_{ik}/P_{jk}$에서 시작해, (1) 벡터 공간의 선형 구조를 살리려면 $F$가 타깃 단어의 **차** $w_i - w_j$에 의존해야 하고, (2) 스칼라 우변과 맞추려면 내적을 취해야 하며, (3) 단어↔문맥 역할 교환($w \leftrightarrow \tilde{w}$, $X \leftrightarrow X^T$)에 대한 대칭성을 위해 $F$가 $(\mathbb{R},+)$→$(\mathbb{R}_{>0},\times)$ 준동형이어야 한다는 조건을 차례로 부과하면 $F = \exp$가 강제되고,

$$w_i^T \tilde{w}_k + b_i + \tilde{b}_k = \log X_{ik}$$

  가 나온다($\log X_i$ 항은 $k$와 무관하므로 편향 $b_i$로 흡수).

- **가중 최소제곱 회귀**: 위 등식은 $X_{ik}=0$에서 발산하고, 희귀한 동시등장은 노이즈가 많다($X$의 원소 중 75~95%가 0). 그래서 가중함수 $f$를 붙인 회귀로 캐스팅한다:

$$J = \sum_{i,j=1}^{V} f(X_{ij}) \left( w_i^T \tilde{w}_j + b_i + \tilde{b}_j - \log X_{ij} \right)^2$$

$$f(x) = \begin{cases} (x/x_{\max})^\alpha & x < x_{\max} \\ 1 & \text{otherwise} \end{cases}, \quad x_{\max}=100,\ \alpha=3/4$$

  $f(0)=0$이라 0 원소는 학습에서 아예 빠지고(희소성 활용), 빈번한 동시등장도 과대 가중되지 않는다. $\alpha=3/4$이 word2vec의 서브샘플링 지수와 같은 값이라는 점이 흥미롭다고 저자들도 언급한다.

- **skip-gram과의 관계 (3.1절)**: skip-gram의 온라인 목적함수를 같은 $(i,j)$ 항끼리 묶으면 $J = -\sum_{ij} X_{ij} \log Q_{ij}$, 즉 $X_i$로 가중된 교차엔트로피가 된다 — "global skip-gram"인 셈. 교차엔트로피 대신 최소제곱을 쓰고 가중치 $X_i$를 자유로운 $f(X_{ij})$로 일반화하면 정확히 GloVe의 목적함수(식 8)와 등가가 된다. 즉 **카운트 기반과 예측 기반 방법은 근본적으로 같은 코퍼스 통계를 보고 있다**는 것이 이 논문의 핵심 주장이다.

- **복잡도**: 모델은 $X$의 0이 아닌 원소 수 $|X|$에 비례한다. 동시등장 빈도가 멱법칙 $X_{ij} = k/r_{ij}^\alpha$를 따른다고 가정하고 일반화 조화수로 전개하면, 실측 $\alpha=1.25$ 기준 $|X| = O(|C|^{0.8})$ — 코퍼스 크기 $|C|$에 선형인 온라인 window 방식보다도 오히려 낫다.

## 주요 결과

- Word analogy(19,544문항): 6B 토큰(Wikipedia 2014 + Gigaword 5), 300차원에서 GloVe 71.7% (word2vec 도구로 직접 학습한 SG† 69.1%, CBOW† 65.7%, SVD-L 60.1%). 42B 토큰 Common Crawl로 키우면 **75.0%**.
- 단어 유사도(WordSim-353, MC, RG, SCWS, RW)에서 동급 코퍼스의 SVD/CBOW/SG를 일관되게 상회하고, CoNLL-2003 NER의 CRF feature로 넣었을 때도 F1 최고치.
- 동일 코퍼스·어휘·window·**학습 시간** 조건에서 GloVe가 word2vec을 일관되게 앞선다(Fig. 4). word2vec은 negative sample을 10개 이상으로 늘리면 오히려 성능이 하락하는 반면, GloVe는 반복을 늘릴수록 단조 개선.
- 학습 세부: $W$와 $\tilde{W}$ 두 벡터 집합을 학습한 뒤 합 $W+\tilde{W}$을 최종 벡터로 사용(약간의 성능 향상), AdaGrad로 $X$의 nonzero를 확률적으로 샘플링, 좌우 10단어 window에 거리 $d$의 단어쌍은 $1/d$로 감쇠 카운트.

## 계보에서의 위치

[Word2Vec](/papers/word2vec/)이 "예측 기반 임베딩이 잘 된다"는 현상을 보였다면, GloVe는 그 현상의 **이유**를 동시등장 통계의 구조로 소급해 설명하고, 같은 정보를 더 직접적으로 회귀하는 모델을 유도했다. "count-based vs. prediction-based" 논쟁(Baroni et al. 2014)에 대한 사실상의 종결 선언 — 둘은 같은 통계를 다른 효율로 소비할 뿐이라는 것. 이후 GloVe 사전학습 벡터는 word2vec과 함께 딥러닝 NLP의 표준 초기화로 쓰였고, 특히 ELMo 이전 시대의 거의 모든 task-specific 모델(그리고 ELMo 논문의 베이스라인 자체)이 GloVe 위에서 출발했다.
