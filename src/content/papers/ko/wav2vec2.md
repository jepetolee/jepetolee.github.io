---
title: "wav2vec 2.0: 라벨 10분으로 음성 인식하기 — 음성의 자기지도 사전학습"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "NeurIPS", "Meta AI", "wav2vec", "자기지도학습", "Transformer", "CTC"]
paper: "wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations"
paperUrl: "https://arxiv.org/abs/2006.11477"
authors: "Alexei Baevski, Henry Zhou, Abdelrahman Mohamed, Michael Auli"
venue: "NeurIPS"
year: 2020
references: ["transformer", "bert", "ctc", "simclr"]
description: raw waveform을 CNN으로 인코딩하고 잠재 표현의 span을 마스킹해, Transformer의 출력이 해당 위치의 양자화된 표현을 distractor들 사이에서 맞히는 대조 학습으로 사전학습한다. 라벨 없는 5.3만 시간 사전학습 후 라벨 10분 미세조정만으로 LibriSpeech WER 4.8/8.2를 달성했다.
---

## 한 줄 요약

BERT의 masked prediction을 음성에 이식할 때의 난관은 타깃이다 — 음성에는 단어 같은 이산 토큰이 없다. wav2vec 2.0의 답은 **타깃을 함께 배우는 것**: CNN이 뽑은 잠재 표현을 Gumbel softmax 양자화로 이산화해 타깃으로 삼고, 마스킹된 위치에서 Transformer의 출력이 진짜 양자화 표현을 distractor 100개 사이에서 골라내는 **대조 학습**을 한다. 라벨 없는 53k시간 사전학습 후 **라벨 10분** 미세조정으로 WER 4.8/8.2 — "전사 데이터가 병목"이라는 ASR의 전제를 무너뜨린 논문이다.

## 핵심 기여

- **3부 구성**: (1) **특징 인코더** — raw waveform을 받는 7블록 CNN(stride 곱 320, 출력 ~49Hz/20ms), (2) **문맥 네트워크** — [Transformer](/papers/transformer/)(Base 12층/Large 24층, 상대 위치는 conv로), (3) **양자화 모듈** — product quantization($G=2$ 그룹 × $V=320$ 엔트리, straight-through Gumbel softmax)이 연속 잠재 $z_t$를 이산 $q_t$로.

- **마스킹 + 대조 손실**: 잠재 시퀀스에서 시작점을 $p=0.065$로 뽑아 $M=10$스텝 span을 마스킹(전체의 ~49%). 마스킹된 위치 $t$에서 문맥 출력 $c_t$가 정답 $q_t$를 같은 발화의 다른 마스킹 위치에서 뽑은 $K=100$개 distractor와 구분해야 한다.

$$\mathcal{L}_m = -\log \frac{\exp(\text{sim}(c_t, q_t)/\kappa)}{\sum_{\tilde{q} \in Q_t} \exp(\text{sim}(c_t, \tilde{q})/\kappa)}$$

  [SimCLR](/papers/simclr/)의 InfoNCE가 "시간축 마스킹 + 양자화 타깃"으로 번역된 형태다. 코드북이 몇 개 엔트리로 붕괴하는 것을 막는 **다양성 손실**(엔트로피 최대화) $\mathcal{L}_d$를 $\alpha=0.1$로 더한다.

- **핵심 설계 발견**: Transformer 입력은 **연속** 잠재를, 대조 타깃은 **양자화** 표현을 쓰는 조합이 최선 — 입력까지 양자화하면 정보가 깎이고, 타깃이 연속이면 과제가 물러진다. "이산 단위와 문맥 표현을 공동 학습하는 것이 사전에 고정된 단위보다 낫다"는 것이 vq-wav2vec(2단계) 대비 이 논문의 진보다.

- **미세조정**: 선형층 하나 얹고 [CTC](/papers/ctc/)로, SpecAugment식 마스킹과 함께. 특징 인코더는 얼린다.

## 주요 결과 (LibriSpeech WER, clean/other)

| 라벨 데이터 | WER |
|---|---|
| 10분 (LV-60k 사전학습) | **4.8 / 8.2** |
| 1시간 | 2.9 / 5.8 |
| 100시간 | 2.0 / 4.0 |
| 960시간 전체 | **1.8 / 3.3** |

- 라벨 1시간으로 종전 100시간 기반 SOTA를 넘고(상대 45% 개선), 전체 960시간에서도 SOTA — **저자원과 고자원 양쪽에서** 유효하다는 것이 중요하다. TIMIT 음소 인식도 PER 7.4/8.3으로 상대 23~29% 개선.
- 10분 = 발화 48개 수준. 소수 언어·도메인 ASR의 실현 가능성을 바꾼 수치다.

## 계보에서의 위치

[BERT](/papers/bert/)의 마스킹 사전학습이 음성의 연속성이라는 장벽을 넘은 지점으로, 음성판 "사전학습+미세조정" 시대를 연 논문이다. 곧바로 후속 논쟁이 생산적이었다 — 대조 학습과 양자화의 복잡성이 정말 필요한가? HuBERT는 오프라인 클러스터링 타깃의 masked prediction으로 같은 것을 더 단순하게 달성하고, 이 노선은 음성 파운데이션 모델(WavLM 등)과 화자·감정 등 비전사 태스크의 범용 표현으로 확장된다. 한편 "그냥 라벨을 68만 시간 모으면?"이라는 정반대 노선이 [Whisper](/papers/whisper/)다 — 자기지도 vs 대규모 약지도의 대결 구도가 여기서 시작된다.
