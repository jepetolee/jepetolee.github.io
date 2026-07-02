---
title: "TDNN: 시간 지연 유닛으로 음소를 인식하다 — 1D convolution의 원형"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "인공신경망", "TDNN", "음소 인식", "CNN"]
paper: "Phoneme Recognition Using Time-Delay Neural Networks"
paperUrl: "https://doi.org/10.1109/29.21701"
authors: "Alexander Waibel, Toshiyuki Hanazawa, Geoffrey Hinton, Kiyohiro Shikano, Kevin J. Lang"
venue: "IEEE Transactions on Acoustics, Speech, and Signal Processing"
year: 1989
references: ["backpropagation"]
description: 유닛 입력에 시간 지연을 두고, 시간축으로 복제된 유닛들이 가중치를 공유하도록 제약해 시간 이동 불변성을 학습하는 Time-Delay Neural Network를 제안한다. 유성 파열음 B/D/G 인식에서 당시 최선의 HMM(93.7%)을 98.5%로 압도했고, 시간축 weight sharing이라는 아이디어는 1D convolution의 원형이 됐다.
---

## 한 줄 요약

음성 인식 신경망의 근본 문제는 같은 음향 사건이 **언제** 일어나는지가 매번 다르다는 것 — 정밀한 시간 정렬 없이는 학습된 특징이 뭉개진다. TDNN의 답은 유닛에 시간 지연 입력($D_1 \dots D_N$)을 달고, 시간축으로 복제된 유닛들이 **가중치를 공유**하게 강제하는 것이다: 어떤 특징 검출기가 배운 것은 모든 시점에서 유효해야 한다. 이것은 정확히 시간축 1D convolution이고 — 유성 파열음 B/D/G 인식에서 당시 최고의 HMM을 오류율 기준 4배 이상(6.3%→1.5%) 앞섰다. LeNet과 같은 시기, 같은 아이디어(weight sharing)가 음성에서 독립적으로 확립된 논문이다.

## 핵심 기여

- **TDNN 유닛**: 일반 유닛의 입력 $J$개 각각에 지연 $D_1, \dots, D_N$을 붙여, 현재와 과거 $N$스텝의 입력을 함께 가중합한다($J=16, N=2$면 가중치 48개 — 16차 입력의 3프레임 창). 유닛 하나가 "현재 입력과 과거 사건의 관계"를 표현할 수 있다.

- **시간 이동 불변성 = weight sharing**: 입력 전체를 시간축으로 스캔하도록 TDNN 유닛을 시점마다 복제하되, **복제본들의 대응 가중치를 같은 값으로 제약**한다 — 역전파는 복제본별로 계산한 그래디언트를 **평균**해서 한 번에 갱신한다. 네트워크는 특징이 "언제" 나타나는지와 무관하게 유용한 음향-음소 특징을 배울 수밖에 없고, 그 덕에 오류가 잦은 사전 시간 정렬/분할 알고리즘에 의존하지 않는다. 오늘날의 언어로 정확히 conv + 파라미터 공유다.

- **구조**: 입력은 16차 멜스케일 필터뱅크(12kHz 샘플링, 256-pt FFT를 5ms마다 → 10ms 프레임, 발화당 15프레임, [-1,1] 정규화 — 이 시절에 이미 [멜 필터뱅크](/insight/audio-signal-fundamentals/)가 입력이다). 은닉 1층은 3프레임 창(30ms — 파열음의 저수준 음향 사건에 충분하다는 선행 연구 기반)의 유닛 8개, 은닉 2층은 5프레임 창 유닛 3개(상위 층일수록 넓은 시간 창 — 계층적 수용 영역), 출력은 9프레임에 걸친 증거를 **합산**(integration)해 B/D/G를 판정한다. 국소 특징은 아래층에서, 길고 복잡한 특징은 위층에서 — CNN의 계층 구조 논리가 그대로 서술되어 있다.

- **학습의 시대상**: 800개 토큰, 역전파 2만~5만 iteration, 4-프로세서 Alliant 슈퍼컴퓨터에서 **며칠**. 3개 토큰으로 시작해 수렴하면 2배씩 늘리는 staged learning으로 시간을 벌었다. 저자들이 "이 계산량은 학습에만 필요하고 인식은 워크스테이션 실시간"이라 방어하는 대목이 1989년의 풍경이다.

## 주요 결과

- 일본어 화자 3명(남성 아나운서), 5240 단어에서 추출한 유성 파열음 B/D/G, 화자 종속 평가: **TDNN 98.5% vs 최선의 HMM 93.7%** (오류율 6.3% → 1.5%, 4배 이상 감소). 세 화자 모두에서 일관.
- HMM 대비 공정성에 주의한 설계 — 각 방법에 최적화된 전처리(HMM은 LPC 기반 VQ)를 허용하고 같은 데이터로 평가.
- **내부 표현 분석**: 은닉 유닛들이 F2 상승/하강, 모음 개시(vowel onset) 같은 음성학 교과서의 특징들을 스스로 "발명"했고, 같은 음소의 다른 문맥 변이("DA" vs "DO")를 서로 다른 내부 경로로 처리해 같은 상위 개념에 연결한다 — 표현 학습이라는 말이 생기기 전의 표현 학습 분석.

## 계보에서의 위치

이 논문의 유산은 두 갈래다. 첫째, **아이디어의 계보**: 시간축 weight sharing은 LeCun의 공간축 weight sharing(LeNet)과 함께 convolution이라는 연산의 두 원류이고(Hinton이 공저자다), 상위 층일수록 넓은 창을 보는 계층 설계는 dilated 1D conv로 이어진다. 둘째, **음성 분야의 계보**: TDNN이라는 이름 자체가 살아남아, 30년 뒤 화자 인식의 [x-vector](/papers/x-vector/)가 dilation을 더한 TDNN 스택으로 부활하고 [ECAPA-TDNN](/papers/ecapa-tdnn/)까지 이어진다. 한편 당시의 승부(TDNN vs HMM)는 이후 20년간 HMM의 승리로 정리됐다가 — 신경망은 HMM의 부품(hybrid DNN-HMM)으로 흡수됐다가 — [CTC](/papers/ctc/)와 end-to-end 시대에 와서야 이 논문이 걸었던 노선이 완성된다.
