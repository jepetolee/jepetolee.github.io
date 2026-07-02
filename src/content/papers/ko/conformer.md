---
title: "Conformer: 어텐션은 전역, convolution은 국소 — 음성 인식의 하이브리드 표준"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "Google Research", "Conformer", "Transformer", "음성 인식", "CNN"]
paper: "Conformer: Convolution-augmented Transformer for Speech Recognition"
paperUrl: "https://arxiv.org/abs/2005.08100"
authors: "Anmol Gulati, James Qin, Chung-Cheng Chiu, Niki Parmar, Yu Zhang, Jiahui Yu, Wei Han, Shibo Wang, Zhengdong Zhang, Yonghui Wu, Ruoming Pang"
venue: "Interspeech"
year: 2020
references: ["transformer", "ctc", "lstm"]
description: 어텐션의 전역 문맥과 depthwise convolution의 국소 패턴 모델링을 한 블록 안에 결합한 Conformer를 제안한다. macaron식 반스텝 FFN 두 개 사이에 상대 위치 어텐션과 conv 모듈을 끼운 블록으로, LibriSpeech에서 WER 1.9/3.9%(LM 포함)의 SOTA를 달성하며 음성 인식 인코더의 표준이 됐다.
---

## 한 줄 요약

음성 신호에는 두 종류의 구조가 공존한다 — 발화 전체에 걸친 전역 의존성(문맥, 화자 특성)과 프레임 몇 개 단위의 국소 패턴(포먼트 전이, 음소 경계). Transformer는 전자에, CNN은 후자에 강하다. Conformer는 한 블록 안에 **어텐션(전역)과 depthwise conv(국소)를 직렬로** 넣고 macaron식 FFN으로 감싸, 두 inductive bias를 파라미터 효율적으로 결합했다 — LibriSpeech SOTA와 함께, 이후 ASR 인코더의 기본형이 된 아키텍처다.

## 핵심 기여

- **Conformer 블록**: 순서가 곧 설계다.

$$\tilde{x} = x + \tfrac{1}{2}\text{FFN}(x), \quad x' = \tilde{x} + \text{MHSA}(\tilde{x}), \quad x'' = x' + \text{Conv}(x'), \quad y = \text{LayerNorm}\!\left(x'' + \tfrac{1}{2}\text{FFN}(x'')\right)$$

  - **MHSA**: Transformer-XL식 **상대 위치 인코딩** — 발화 길이가 제각각인 음성에서 절대 위치보다 강건하고, ablation에서 가장 큰 기여(제거 시 dev-other +1.4%).
  - **Conv 모듈**: pointwise conv + GLU → **1D depthwise conv(커널 32)** → BatchNorm → Swish → pointwise. 비전 경량화 계보의 depthwise separable(MobileNet)이 음성 인코더의 국소 모델링 부품으로 수입된 것.
  - **Macaron FFN**: FFN 하나를 앞뒤 반스텝 두 개로 쪼개 어텐션+conv를 샌드위치(Macaron-Net에서 차용). 단일 FFN으로 되돌리면 +0.7%.
  - 배치 ablation: conv를 어텐션 **뒤에** 직렬로 — 병렬이나 어텐션 앞보다 좋다.

- **모델 패밀리와 학습**: S(10.3M)/M(30.7M)/L(118.8M), 인코더 16~17층. 디코더는 단층 LSTM의 **RNN-Transducer** — [CTC](/papers/ctc/)의 프레임 독립 가정을 예측 네트워크로 보완한 스트리밍 친화 프레임이다. LibriSpeech 970시간, 80차 필터뱅크, SpecAugment.

## 주요 결과 (LibriSpeech WER, test-clean/test-other)

| 모델 | LM 없음 | LM 포함 |
|---|---|---|
| Conformer S (10.3M) | 2.7 / 6.3 | 2.1 / 5.0 |
| Conformer M (30.7M) | 2.3 / 5.0 | 2.0 / 4.3 |
| **Conformer L (118.8M)** | **2.1 / 4.3** | **1.9 / 3.9** |

- M(30.7M)이 이미 Transformer Transducer(139M)의 종전 SOTA를 넘는다 — 하이브리드 블록의 **파라미터 효율**이 논지의 핵심 증거.
- ablation: conv 모듈 제거가 가장 아프고(+0.4%), 같은 크기의 순수 Transformer 대비 전 구간 우위. Swish는 미미하지만 수렴이 빨랐다.

## 계보에서의 위치

[Transformer](/papers/transformer/)가 NLP에서 "어텐션만으로 충분하다"를 외쳤다면, Conformer는 음성에서 "**어텐션만으로는 아깝다**"고 답한 논문이다 — 신호의 국소 구조가 명확한 도메인에서는 conv라는 bias를 되찾는 것이 이득이라는 것. 비전의 Swin이 같은 시기 같은 결론(국소 윈도우)에 도달한 것과 나란히 놓고 읽을 만하다. 이후 Conformer 인코더는 지도 ASR을 넘어 wav2vec 2.0류 자기지도 사전학습, 스트리밍 인식, 심지어 화자 검증(MFA-Conformer)까지 음성 전반의 기본 인코더가 됐고, 변형(Squeezeformer, E-Branchformer)들이 그 뒤를 다듬고 있다. 인식 모델 차원에서 보면 — [TDNN](/papers/tdnn/)의 국소 시간 창에서 출발해, [CTC](/papers/ctc/)/RNN-T가 정렬을 풀고, Conformer가 인코더를 완성한 것이 지도학습 ASR 30년의 요약이다.
