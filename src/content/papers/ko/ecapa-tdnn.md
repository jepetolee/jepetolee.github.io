---
title: "ECAPA-TDNN: 채널 어텐션과 다중 스케일로 x-vector를 완성하다"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 화자 인식
tags: ["ASR", "인공신경망", "ECAPA-TDNN", "화자 인식", "어텐션", "TDNN"]
paper: "ECAPA-TDNN: Emphasized Channel Attention, Propagation and Aggregation in TDNN Based Speaker Verification"
paperUrl: "https://arxiv.org/abs/2005.07143"
authors: "Brecht Desplanques, Jenthe Thienpondt, Kris Demuynck"
venue: "Interspeech"
year: 2020
references: ["x-vector", "senet", "resnet", "arcface"]
description: x-vector의 TDNN에 1D SE-Res2Net 블록(채널 게이팅 + 다중 스케일), 전 층 특징 결합(MFA), 채널·문맥 의존 attentive statistics pooling을 더하고 AAM-softmax로 학습한다. VoxCeleb1-O EER 0.87%로 TDNN·ResNet 계열 베이스라인을 모두 넘어 현대 화자 검증의 사실상 표준이 됐다.
---

## 한 줄 요약

[x-vector](/papers/x-vector/) 이후 2년간 비전에서 검증된 부품들 — [SE 블록](/papers/senet/), Res2Net 다중 스케일, 어텐션 풀링, [AAM-softmax](/papers/arcface/) — 를 TDNN 화자 임베딩에 체계적으로 이식·개조한 집대성이다. 이름이 곧 목차다: **E**mphasized **C**hannel **A**ttention(SE + 채널별 어텐션 풀링), **P**ropagation(잔차 전파), **A**ggregation(전 층 특징 결합). VoxCeleb1-O EER **0.87%** — 화자 검증을 1% 아래로 데려온, 이후 수년간의 기본값.

## 핵심 기여

- **채널·문맥 의존 attentive statistics pooling**: 기존 어텐션 풀링은 "어느 프레임이 중요한가"만 물었다. ECAPA는 어텐션을 **채널별로** 분리해 — 화자마다 다른 시점에서 다른 주파수 특성이 드러난다는 관찰 — 프레임 $t$, 채널 $c$의 점수를 $e_{t,c} = v_c^T f(W h_t + b) + k_c$로 계산하고, softmax 가중치로 채널별 가중 평균·표준편차를 만든다.

$$\tilde{\mu}_c = \sum_t \alpha_{t,c}\, h_{t,c}, \qquad \tilde{\sigma}_c = \sqrt{\textstyle\sum_t \alpha_{t,c}\, h_{t,c}^2 - \tilde{\mu}_c^2}$$

  어텐션 입력에 발화 전체의 통계(global context)를 이어붙여, 노이즈·녹음 조건 같은 발화 수준 특성에 어텐션이 적응하게 했다.

- **1D SE-Res2Block**: TDNN의 각 블록을 (1×1 conv → **Res2Net 다중 스케일 dilated conv** → 1×1 conv) + **1D SE 게이팅**의 residual 블록으로 교체. Res2Net은 채널을 쪼개 계단식으로 연결해 블록 안에서 여러 시간 스케일을 만들면서 파라미터를 ~30% 절약하고, SE는 시간 평균으로 짜낸 전역 문맥으로 채널을 재보정한다 — 프레임 층의 좁은 시간 문맥이라는 x-vector의 한계를 두 방향(다중 스케일 + 전역 게이팅)에서 보완.

- **MFA + 잔차 전파**: 마지막 층만 풀링에 넣는 대신 **모든 SE-Res2Block의 출력을 이어붙여** 풀링 전 dense 층에 넣는다(얕은 층의 특징도 화자 정보를 담는다는 근거). 블록 간 연결도 단순 skip이 아니라 이전 블록 출력들의 합으로.

- **학습**: 80차 MFCC, MUSAN+RIR 6배 증강 + SpecAugment, **AAM-softmax(m=0.2, s=30)**, cyclical LR. VoxCeleb2 dev(5,994화자)로 학습. C=512(6.2M)와 C=1024(14.7M) 두 크기.

## 주요 결과

- VoxCeleb1 (EER): E-TDNN(large, 20.4M) 1.26 / ResNet34 1.19 / **ECAPA C=1024(14.7M) 0.87** — O/E/H 전 조건에서 최고, 최고 베이스라인 대비 평균 상대 18.7% 개선을 더 적은 파라미터로.
- **Ablation이 부품별 기여를 깔끔하게 분리**: SE 블록이 가장 크고(EER 상대 20.5%), 채널별 어텐션 9.8%, MFA 8.2%, Res2Net 5.6%(+파라미터 30% 절감) — 어느 하나의 트릭이 아니라 축적의 승리임을 보여준다.
- VoxSRC 2019/2020 계열 평가에서도 일반화 확인 — 실제로 이 그룹은 이 구조로 VoxSRC 2020에서 우승했다.

## 계보에서의 위치

[x-vector](/papers/x-vector/)가 세운 "인코더 → 풀링 → 분류 학습" 틀을 유지한 채 각 부품을 최신화한 완성형으로, 발표 이후 화자 검증·화자 분리(diarization)·안티스푸핑의 **기본 백본**이 됐다(SpeechBrain 등 툴킷의 디폴트). 비전 계보의 부품들이 1D로 번역되어 들어온 경로 — [SENet](/papers/senet/)→SE-Res2Block, [ArcFace](/papers/arcface/)→AAM-softmax — 가 특히 선명해서, 이 블로그의 비전 시리즈와 나란히 읽으면 "도메인은 달라도 부품은 흐른다"는 그림이 완성된다. 이후의 개선은 주로 스케일(더 큰 데이터, wav2vec 2.0류 자기지도 front-end 결합)과 경량화(모바일 배포) 방향으로 진행 중이다.
