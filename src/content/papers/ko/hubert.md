---
title: "HuBERT: 나쁜 클러스터라도, 마스킹 예측이면 배운다"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "Meta AI", "HuBERT", "자기지도학습", "Transformer"]
paper: "HuBERT: Self-Supervised Speech Representation Learning by Masked Prediction of Hidden Units"
paperUrl: "https://arxiv.org/abs/2106.07447"
authors: "Wei-Ning Hsu, Benjamin Bolte, Yao-Hung Hubert Tsai, Kushal Lakhotia, Ruslan Salakhutdinov, Abdelrahman Mohamed"
venue: "IEEE/ACM TASLP"
year: 2021
references: ["wav2vec2", "bert", "ctc"]
description: MFCC의 k-means 클러스터를 의사 라벨로 삼아 마스킹된 프레임의 클러스터를 맞히는 BERT식 masked prediction으로 음성 표현을 사전학습하고, 배운 표현을 다시 클러스터링해 타깃을 반복 개선한다. 손실을 마스킹 영역에만 걸면 타깃 품질이 나빠도 학습이 성립하며, wav2vec 2.0을 전 구간에서 앞선다.
---

## 한 줄 요약

wav2vec 2.0의 대조 학습은 negative 샘플링, 양자화, 다양성 손실 같은 장치가 얽혀 있다. HuBERT는 훨씬 우직한 길을 간다 — **MFCC를 k-means로 뭉쳐 만든 조잡한 의사 라벨**을 타깃으로 BERT식 masked prediction을 하고, 배운 표현으로 다시 클러스터링해 타깃을 개선하는 반복. 성립의 열쇠는 **손실을 마스킹된 프레임에만 거는 것**이다: 타깃이 형편없어도, 문맥으로부터 그 타깃의 구조를 예측하는 과정 자체가 음향+언어 모델링을 강제한다. 결과는 wav2vec 2.0 전 구간 우위.

## 핵심 기여

- **문제 인식**: 음성 자기지도의 세 난관 — 발화 하나에 소리 단위가 여러 개(문장 수준 라벨 불가), 단위의 사전(lexicon)이 없음(BERT처럼 어휘를 참조 불가), 단위 경계가 없음(가변 길이, 무분할). HuBERT의 답: **단위 발견(클러스터링)과 표현 학습(마스킹 예측)을 분리**하되 반복으로 서로를 개선시킨다.

- **1라운드 — MFCC 클러스터**: 39차 MFCC를 k-means($k=100$)로 클러스터링해 프레임별 의사 라벨을 만든다. CNN 인코더(wav2vec 2.0과 동일) + Transformer가 wav2vec 2.0식 span 마스킹(8% 시작점, 길이 10) 아래에서 마스킹된 프레임의 클러스터 ID를 교차엔트로피로 예측한다.

- **마스킹 영역에만 손실 — 논문의 심장**: 손실을 마스킹/비마스킹 어디에 거는지의 ablation이 극적이다. 저품질 타깃(MFCC k-means)에서 마스킹 영역만($\alpha=1$) 걸면 WER 17.86%, **비마스킹에만 걸면 96.37%** — 후자는 나쁜 라벨을 그대로 흉내내는 음향 매핑으로 붕괴하지만, 전자는 "보이지 않는 구간을 문맥으로 추론"해야 하므로 타깃의 노이즈 위에 있는 구조를 배운다. BERT의 설계가 왜 노이즈 타깃에 강건한지에 대한 가장 깨끗한 실험이다.

- **반복 정제와 앙상블**: 1라운드 모델의 중간층(Base 기준 6층) 특징을 다시 k-means($k=500$)로 클러스터링하면 타깃 품질(음소와의 PNMI)이 0.25~0.29에서 0.56~0.70으로 뛰고, 이 타깃으로 2라운드를 학습한다. 서로 다른 $k$의 클러스터를 멀티태스크로 함께 예측하는 앙상블도 유효.

- **모델**: Base 95M / Large 317M / X-Large **964M**(48층) — Libri-light 60k시간 사전학습, 미세조정은 [CTC](/papers/ctc/).

## 주요 결과 (LibriSpeech dev-other/test-other WER, Large 기준)

| 라벨 | HuBERT | wav2vec 2.0 |
|---|---|---|
| 10분 | **7.0 / 7.6** | 7.9 / 8.2 |
| 1시간 | **4.9 / 5.4** | 5.4 / 5.8 |
| 100시간 | **3.7 / 3.9** | 4.0 / 4.0 |

- X-Large(1B)는 test-other **2.9%**로 Large 대비 상대 13~19% 추가 개선 — 음성 자기지도도 스케일이 통한다.

## 계보에서의 위치

[wav2vec 2.0](/papers/wav2vec2/)이 연 음성 자기지도를 "대조 없이, 더 단순하게"로 재정리한 논문이다 — 비전에서 [MAE](/papers/mae/)가 대조 계열에 대해 한 일과 정확히 평행하다([자기지도학습 세 갈래](/insight/self-supervised-learning/)의 음성판 구도). 유산은 ASR을 넘는다: 프레임을 이산 클러스터 ID의 시퀀스로 만드는 구조가 그대로 **음성의 토큰화**라서, HuBERT 단위는 textless NLP(GSLM)와 음성 LM, 나아가 음성-텍스트 통합 모델의 이산 인터페이스가 됐다. 후속 WavLM이 발화 중첩·노이즈 시뮬레이션을 더해 화자 태스크까지 커버하는 범용 음성 표현으로 확장했고, 화자 검증에서도 이런 사전학습 front-end + [ECAPA](/papers/ecapa-tdnn/)류 백엔드 조합이 최고 성능을 갱신하고 있다.
