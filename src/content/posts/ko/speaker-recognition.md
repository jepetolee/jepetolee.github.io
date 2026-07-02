---
title: "ASR의 근간 (2): Speaker Recognition — 식별과 검증, 그리고 임베딩 계보"
date: 2026-07-02
draft: false
category: 개념 정리
tags: ["ASR", "머신 러닝", "화자 인식", "화자 검증", "메트릭 러닝"]
description: Speaker Recognition을 Identification(1:N 분류)과 Verification(1:1 판정)으로 구분하고, 화자 임베딩 파이프라인(인코더 → 풀링 → 스코어링)과 평가 지표(EER, minDCF)를 정리한다. i-vector에서 x-vector, ResNet-SE 계열, ECAPA-TDNN까지의 아키텍처 계보와, 얼굴 인식에서 건너온 AAM-softmax(ArcFace)가 임베딩 간 거리를 벌리는 원리까지.
tldr:
  - Identification은 "누구인가"(1:N, closed-set 분류), Verification은 "이 사람이 맞는가"(1:1, open-set 판정) — 실무의 대부분은 미등록 화자를 다뤄야 하는 Verification이고, 그래서 분류가 아니라 임베딩 학습 문제가 된다.
  - 현대 파이프라인은 "발화 → 프레임 인코더(TDNN/ResNet) → 시간 풀링 → 고정 차원 임베딩 → 코사인/PLDA 스코어링"으로 통일되어 있고, 평가는 EER과 minDCF로 한다.
  - 학습 손실이 승부처다 — softmax 분류만으로는 클래스 간 마진이 없어서, ArcFace(AAM-softmax)의 각도 마진이 화자 임베딩의 표준 손실로 이식됐다.
prerequisites:
  - 멜 스펙트로그램 등 음성 특징 표현에 대한 이해 (ASR의 근간 (1) 참고)
---

## 같은 소리에서 다른 것을 듣기

같은 오디오를 두고 ASR은 "무엇을 말했나"를, Speaker Recognition은 "**누가** 말했나"를 묻는다 — 전자는 화자 정보를 지워야 하고 후자는 언어 내용을 지워야 하니, 사실상 서로의 노이즈를 신호로 쓰는 쌍둥이 문제다. 이 글은 후자의 문제 정의와 모델 계보를 정리한다.

## 문제의 구분 — Identification vs Verification

**Speaker Identification (SID)** — "이 목소리는 등록된 $N$명 중 누구인가?" 1:N **분류** 문제이고, 테스트 화자가 반드시 등록 집합 안에 있다고 가정하면 closed-set이다. 정확도로 평가한다.

**Speaker Verification (SV)** — "이 목소리가 주장된 그 사람이 맞는가?" 등록 발화(enrollment)와 테스트 발화의 **1:1 판정**이다. 본질적으로 open-set — 시스템은 학습 때 본 적 없는 화자들 사이의 판정을 해야 한다. 이 차이가 결정적이다: **closed-set 분류는 학습된 클래스 경계로 풀리지만, open-set 검증은 임의의 새 화자 쌍에 일반화되는 거리 공간, 즉 임베딩을 요구한다.** 그래서 현대 화자 인식 연구의 실체는 "화자 임베딩 학습"이고, SID는 임베딩 위 최근접 분류로 흡수된다.

직교하는 분류축이 하나 더 있다 — **text-dependent**(정해진 문구, "Hey Siri"류 웨이크워드 검증)와 **text-independent**(아무 말이나, VoxCeleb 계열 연구의 표준 세팅).

평가 지표는 검증 태스크의 두 오류 — 본인 거부(false rejection)와 타인 수락(false acceptance) — 의 트레이드오프에서 나온다. 판정 임계값을 움직이며 두 오류율이 같아지는 지점이 **EER**(Equal Error Rate), 응용별 비용·사전확률로 가중한 최소 비용이 **minDCF**다. VoxCeleb 기준 EER이 i-vector 시대 ~5%대에서 ECAPA-TDNN에서 1% 아래로 내려온 것이 이 분야의 최근 10년이다.

## 파이프라인 — 인코더, 풀링, 스코어링

현대 시스템은 구조가 통일되어 있다:

1. **프레임 인코더**: 로그 멜 필터뱅크(또는 raw waveform)를 받아 프레임 수준 표현을 만든다.
2. **시간 풀링**: 가변 길이 프레임 시퀀스를 고정 차원으로 접는다 — 평균/표준편차를 잇는 statistics pooling([x-vector](/papers/x-vector/)), 프레임별 중요도를 학습하는 attentive statistics pooling(ECAPA).
3. **임베딩**: 풀링 뒤 선형층의 출력(보통 192~512차)이 화자 임베딩.
4. **스코어링**: 두 임베딩의 코사인 유사도, 또는 화자 내/화자 간 변동을 명시적으로 모델링하는 PLDA.

## 아키텍처 계보 — 연도순

- **i-vector (2011 전후)**: 딥러닝 이전의 지배자. GMM 슈퍼벡터의 저차원 전역 변동 부분공간으로 발화를 요약하는 통계 모델 — "발화를 고정 차원 벡터로"라는 문제 형식 자체를 이 계보가 정립했다.
- **d-vector (2014)**: DNN의 은닉층 활성을 프레임 평균한 초기 신경망 임베딩. text-dependent 웨이크워드 검증에서 출발.
- **[x-vector](/papers/x-vector/) (2018)**: [TDNN](/papers/tdnn/) 인코더 + statistics pooling + 화자 분류 학습, 그리고 **데이터 증강**의 결합으로 i-vector를 명확히 넘어선 첫 표준. 이후 모든 시스템의 기준점.
- **ResNet-SE 계열 (2018~)**: 스펙트로그램을 2D 이미지처럼 취급해 [ResNet](/papers/resnet/)-34류를 돌리는 노선 — VoxCeleb 데이터셋 공개(2017~18)와 함께 퍼졌고, VoxSRC 챌린지 시스템들이 [SE 블록](/papers/senet/)을 얹은 ResNet-SE 변형을 표준 backbone으로 굳혔다. 이 계열은 단일 대표 논문 없이 챌린지 시스템 기술서(Clova baseline 등)로 전파됐다는 점이 특징이다 — TDNN 계열(1D, 시간축 conv)과 ResNet 계열(2D, 시간·주파수 conv)의 양강 구도가 지금도 유지된다.
- **raw waveform 계열**: 특징 추출마저 학습하는 노선 — 첫 층을 sinc 대역통과 필터로 매개화한 [SincNet](/papers/sincnet/)(2018), 그 위의 end-to-end 임베딩 [RawNet](/papers/rawnet/)(2019).
- **[ECAPA-TDNN](/papers/ecapa-tdnn/) (2020)**: x-vector의 TDNN에 SE 블록, Res2Net 다중 스케일, 계층 간 특징 결합, attentive statistics pooling을 집약한 현재의 사실상 표준. VoxCeleb EER을 1% 아래로 끌어내렸다.

## 손실 함수 — 왜 ArcFace가 여기로 왔나

임베딩을 화자 분류(softmax)로 학습하면 문제가 하나 남는다: softmax는 클래스를 **구분**만 하면 손실이 내려가므로, 결정 경계 근처에 임베딩이 몰려도 벌점이 없다. 학습 화자는 잘 갈라지지만, open-set의 새 화자 쌍에는 마진 없는 공간이 취약하다.

얼굴 인식이 정확히 같은 문제(수만 명 학습, 미등록 인물 검증)를 먼저 앓았고, 그 답이 **[ArcFace / AAM-softmax](/papers/arcface/)**다 — 임베딩과 클래스 가중치를 모두 정규화해 유사도를 각도로 환원하고, 정답 클래스의 각도에 **가산 마진 $m$**을 더해 $\cos(\theta + m)$으로 학습한다. 같은 화자는 각도로 뭉치고 다른 화자와는 최소 $m$만큼 벌어진 공간이 강제된다. 화자 검증 커뮤니티가 이를 그대로 이식해(ECAPA-TDNN도 AAM-softmax로 학습된다) 지금은 화자 임베딩의 기본 손실이다 — **open-set 생체 인식이라는 문제 구조가 같으면, 도메인이 달라도 해법이 이식된다**는 좋은 사례.

## 관전 포인트

이 분야를 읽을 때 헷갈리기 쉬운 용어 하나를 짚어두면 — 문헌에서 ASR은 보통 음성 인식(Automatic Speech Recognition)을 가리키고, 화자 인식은 별도 분야(speaker recognition)다. 하지만 파이프라인의 부품(멜 필터뱅크, TDNN/Conformer 인코더)과 커뮤니티(Interspeech, ICASSP)를 공유하고, 안티스푸핑·화자 분리(diarization)까지 포함해 하나의 생태계로 움직인다. 이 시리즈에서는 그 생태계 전체를 묶어 다룬다.
