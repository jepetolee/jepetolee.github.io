---
title: "RawNet: 파형에서 화자 임베딩까지, 특징 공학 없는 end-to-end"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 화자 인식
tags: ["ASR", "인공신경망", "RawNet", "화자 인식", "raw waveform"]
paper: "RawNet: Advanced end-to-end deep neural network using raw waveforms for text-independent speaker verification"
paperUrl: "https://arxiv.org/abs/1904.08104"
authors: "Jee-weon Jung, Hee-soo Heo, Ju-ho Kim, Hye-jin Shim, Ha-jin Yu"
venue: "Interspeech"
year: 2019
references: ["sincnet", "resnet", "lstm"]
description: 전처리 없는 raw waveform을 strided conv → residual 블록 → GRU로 처리해 발화 수준 화자 임베딩을 뽑는 end-to-end 시스템. VoxCeleb1에서 스펙트로그램 기반 시스템과 동급 이상(EER 4.0%)을 달성했고, 후속 RawNet2가 첫 층을 SincNet의 sinc 필터로 교체하며 raw waveform 노선을 굳혔다.
---

## 한 줄 요약

멜 필터뱅크·MFCC의 하이퍼파라미터(창 길이, 필터 수, 차원)를 고르는 일 자체를 없애자 — RawNet은 pre-emphasis 말고는 아무 전처리 없는 **raw waveform을 입력으로, 화자 임베딩을 출력으로** 하는 완전한 end-to-end 시스템이다. residual conv 스택이 프레임 특징을, GRU가 발화 수준 집약을 맡고, VoxCeleb1에서 스펙트로그램 기반 ResNet 시스템과 동급 이상(EER 4.0%)을 찍으며 "특징 추출도 학습 대상"이라는 노선을 화자 검증에서 실증했다. 한국(서울시립대) 그룹의 연구라는 점도 기록해둘 만하다.

## 핵심 기여

- **아키텍처**: strided conv(길이 3, stride 3, 128필터)가 파형을 1차 요약 → **residual 블록 6개**(각 conv 2층 + BN + leaky ReLU + max pooling)가 계층 특징 추출([ResNet](/papers/resnet/)의 skip connection을 1D로) → **GRU(1024)**가 가변 길이 프레임 시퀀스를 발화 벡터 하나로 집약 → FC에서 **128차 화자 임베딩**. 선행 CNN-LSTM 대비 GRU 채택, leaky ReLU, 임베딩 차원 축소(1024→128)가 변경점이고, CNN 부분을 global average pooling으로 사전학습한 뒤 GRU를 얹는 2단계 학습으로 수렴을 안정화했다.

- **손실 설계**: 화자 분류 교차엔트로피에 **center loss**(클래스 내 분산 축소)와 **speaker basis loss**(클래스 간 분리 확대)를 결합 — [AAM-softmax](/papers/arcface/) 이전 세대의 "임베딩 간 거리 벌리기" 장치들이다. 이후 계보에서 이 자리는 각도 마진 계열로 교체된다.

- **백엔드**: 코사인 유사도 외에, 두 임베딩의 연결+원소곱을 입력으로 판정 DNN을 학습하는 b-vector 계열 백엔드를 비교 — 원소곱 항이 결정적이었다(concat&mul 4.0%).

- **학습**: VoxCeleb1(1,211 화자, 330시간)만 사용, 증강 없음. 발화를 59,049샘플(~3.7초)로 맞추고 AMSGrad로 학습.

## 주요 결과 (VoxCeleb1, EER)

| 시스템 | 입력 | EER |
|---|---|---|
| i-vector/LDA | MFCC | 7.25% |
| x-vector (증강) | 필터뱅크 | 9.9% |
| 선행 CNN-LSTM (raw) | waveform | 8.7% |
| 스펙트로그램 ResNet-20 + A-softmax (대규모 증강) | 스펙트로그램 | 4.3% |
| **RawNet + cosine** | waveform | **4.8%** |
| **RawNet + concat&mul 백엔드** | waveform | **4.0%** |

- 증강 없이, raw 입력으로, 무거운 증강을 쓴 스펙트로그램 시스템과 동급 이상 — 선행 raw waveform 시스템 대비 상대 오류 46% 감소.
- 주의해서 읽을 부분: 이 시기 VoxCeleb1 벤치마크는 시스템 간 학습 데이터·증강 조건이 제각각이라(x-vector 수치가 유난히 나쁜 것도 세팅 차이), 표는 "raw 입력이 경쟁력 있다"의 증거로 읽는 것이 정확하다.

## 계보에서의 위치

[SincNet](/papers/sincnet/)이 "첫 층을 어떻게 매개화할 것인가"에 집중했다면, RawNet은 **파형→임베딩 전체 파이프라인**을 조립해 보였다 — 그리고 두 노선은 곧바로 합류한다: **RawNet2**(2020)가 첫 conv층을 SincNet의 sinc 필터로 교체하고 필터별 게이팅(FMS)을 더해 성능을 끌어올렸다. 이후 RawNet 계열은 화자 검증보다 **안티스푸핑(ASVspoof)**에서 더 큰 존재감을 갖게 되는데 — 합성음의 인공물은 수공 특징이 지워버리는 대역에 숨어 있어 raw 입력의 이점이 극대화되기 때문이다. 주류 화자 검증은 여전히 멜 필터뱅크 + [ECAPA-TDNN](/papers/ecapa-tdnn/) 계열이 잡고 있어, "raw vs 멜"의 승부는 태스크에 따라 갈렸다는 것이 현재 스코어다.
