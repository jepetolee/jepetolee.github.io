---
title: "CTC: 정렬 없이 시퀀스를 라벨링하다"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "머신 러닝", "ICML", "CTC", "음소 인식", "LSTM"]
paper: "Connectionist Temporal Classification: Labelling Unsegmented Sequence Data with Recurrent Neural Networks"
paperUrl: "https://www.cs.toronto.edu/~graves/icml_2006.pdf"
authors: "Alex Graves, Santiago Fernández, Faustino Gomez, Jürgen Schmidhuber"
venue: "ICML"
year: 2006
references: ["lstm"]
description: 프레임별 정렬 라벨 없이 시퀀스 수준 라벨만으로 RNN을 학습하는 CTC 손실을 제안한다. blank 토큰을 도입하고, 타깃으로 접히는 모든 경로의 확률 합을 forward-backward 동적 계획법으로 미분 가능하게 계산해, TIMIT 음소 인식에서 HMM과 하이브리드를 모두 넘어섰다.
---

## 한 줄 요약

음성 인식 학습의 고질적 문제: 오디오는 프레임 단위($T$개)인데 정답은 음소/문자 시퀀스($U \ll T$개)이고, **어느 프레임이 어느 라벨인지(정렬)는 아무도 모른다.** HMM은 정렬을 잠재변수로 모델링했고, 하이브리드는 강제 정렬을 만들어 프레임 라벨을 붙였다. CTC의 답은 더 깔끔하다 — **가능한 모든 정렬에 대해 합산해버려라.** blank 토큰과 동적 계획법으로 이 합을 미분 가능하게 계산하면, RNN을 시퀀스 라벨만으로 end-to-end 학습할 수 있다. 이후 15년간 모든 end-to-end ASR의 출발점이 된 손실 함수다.

## 핵심 기여

- **Blank와 경로의 붕괴**: 출력 어휘 $L$에 blank($-$)를 더해 매 프레임 $L+1$개에 대한 softmax를 출력한다. 프레임별 출력 시퀀스(경로 $\pi$)를 다대일 사상 $\mathcal{B}$ — **연속 중복을 접고 blank를 지운다** — 로 라벨 시퀀스에 대응시킨다: $\mathcal{B}(a{-}ab{-}) = \mathcal{B}({-}aa{-}{-}abb) = aab$. blank가 없으면 "같은 라벨 연속"(aab)을 표현할 수 없고, 아무 라벨도 아닌 프레임(묵음, 전이 구간)을 처리할 수 없다.

- **모든 정렬의 합**: 타깃 $\mathbf{l}$의 확률은 그리로 접히는 모든 경로의 합이다.

$$p(\mathbf{l} \mid \mathbf{x}) = \sum_{\pi \in \mathcal{B}^{-1}(\mathbf{l})} p(\pi \mid \mathbf{x}), \qquad p(\pi \mid \mathbf{x}) = \prod_{t=1}^{T} y^t_{\pi_t}$$

  경로 수는 지수적이지만, 라벨 사이와 양끝에 blank를 끼운 확장 시퀀스 $\mathbf{l}'$ 위의 **forward-backward 재귀**(HMM의 것과 같은 동적 계획법)로 $O(T|\mathbf{l}'|)$에 계산된다. $\alpha_t(s)\beta_t(s)$가 "시각 $t$에 기호 $s$를 지나는 모든 경로의 확률"이 되어, 손실 $-\ln p(\mathbf{l}|\mathbf{x})$의 그래디언트가 프레임별로 닫힌 형태로 떨어진다 — **정렬 추정과 학습이 한 손실 안에서 동시에** 일어난다.

- **디코딩**: 프레임별 argmax 후 $\mathcal{B}$를 적용하는 best path(근사)와, blank 확률로 가지를 치는 prefix search. TIMIT에서 prefix search가 약 1%p 더 좋다.

- **스파이크 현상**: 학습 초기 출력은 blank로 도배되다가, 수렴하면 각 라벨이 **좁은 스파이크**로 나타나고 나머지는 전부 blank가 된다(Fig. 4). 라벨의 지속 시간을 모델링하지 않고 "발생"만 표시하는 CTC의 성격이 그대로 보이는 그림 — 세그먼테이션이 필요 없는 태스크에서는 미덕이고, 정확한 경계가 필요한 태스크에서는 한계다.

## 주요 결과

- TIMIT 음소 인식(입력 26차 = MFCC 12 + 로그 에너지 + Δ, 출력 61 음소 + blank), BLSTM 양방향 각 100블록, 총 114,662 가중치:

| 시스템 | 라벨 오류율 |
|---|---|
| Context-independent HMM | 38.85% |
| Context-dependent HMM (~900k 파라미터) | 35.21% |
| BLSTM/HMM 하이브리드 | 33.84% |
| 가중 오류 BLSTM/HMM | 31.57% |
| CTC (best path) | 31.47% |
| **CTC (prefix search)** | **30.51%** |

- 같은 BLSTM 구조의 하이브리드보다 좋고, 하이브리드가 필요로 한 가중 오류 휴리스틱도 불필요 — 목적함수가 라벨의 지속시간·분할이 아니라 **시퀀스**에만 의존하기 때문이라고 정리한다.

## 계보에서의 위치

[LSTM](/papers/lstm/)이 "긴 시퀀스를 기억하는 부품"을, CTC가 "정렬 없이 학습하는 손실"을 제공하면서 end-to-end 음성 인식의 두 부품이 갖춰졌다 — 실제로 대규모 실증은 몇 년 뒤(Graves 2014, Deep Speech 2015)에 온다. 이후 계보가 셋으로 갈라진다: CTC의 프레임 독립 가정(출력끼리 조건부 독립)을 예측 네트워크로 보완한 **RNN-Transducer**(스트리밍 ASR의 표준이 되어 [Conformer](/papers/conformer/)와 결합), 정렬을 어텐션에 맡긴 **LAS 계열**, 그리고 CTC를 보조 손실/정렬 도구로 쓰는 하이브리드들. NLP 관점에서 보면 CTC는 "출력 길이를 모르는 seq2seq"의 최초의 실용해였고, blank라는 장치는 이후 non-autoregressive 생성 연구에서도 재발견된다.
