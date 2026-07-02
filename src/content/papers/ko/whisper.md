---
title: "Whisper: 68만 시간의 약지도가 만드는 강건함"
date: 2026-07-02
draft: false
category: 음성 처리
subcategory: 음성 인식
tags: ["ASR", "OpenAI", "Whisper", "음성 인식", "제로샷", "약지도 학습"]
paper: "Robust Speech Recognition via Large-Scale Weak Supervision"
paperUrl: "https://arxiv.org/abs/2212.04356"
authors: "Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, Ilya Sutskever"
venue: "ICML"
year: 2023
references: ["transformer", "gpt-2", "wav2vec2", "deep-speech-2"]
description: 웹에서 수집·필터링한 68만 시간의 약지도 (오디오, 전사) 쌍으로 표준 인코더-디코더 Transformer를 다국어·다태스크(전사, 번역, 언어 식별, 타임스탬프) 학습한다. 미세조정 없는 제로샷 전이가 목표로, 벤치마크 특화 모델보다 분포 밖 강건성에서 압도적이며(wav2vec 2.0 대비 평균 오류 55% 감소) 인간 전사자에 근접한다.
---

## 한 줄 요약

[wav2vec 2.0](/papers/wav2vec2/) 계열은 훌륭한 오디오 인코더를 배우지만 결국 데이터셋별 미세조정이 필요하고, 그렇게 만든 모델은 LibriSpeech에서 "초인적"이어도 분포가 바뀌면 무너진다. Whisper의 노선은 정반대다 — 아키텍처 혁신 없이 **표준 인코더-디코더 Transformer**를, 웹에서 긁어 필터링한 **68만 시간의 약지도 (오디오, 전사) 쌍**으로 다국어·다태스크 학습해, **미세조정 없이 어디서나 작동하는** 시스템을 만든다. 특정 벤치마크의 SOTA가 아니라 "어떤 분포에서도 안 무너지는 것"이 목표라는 문제 재정의가 이 논문의 본체다.

## 핵심 기여

- **데이터가 방법이다**: 68만 시간 = 영어 전사 563k + 비영어 96개 언어 117k + X→영어 번역 125k. 필터링이 공정의 핵심 — 기계 생성 전사 탐지(전부 대문자/구두점 부재 등의 패턴), 오디오 언어 감지와 전사 언어의 일치 확인, fuzzy 중복 제거, 오류 다발 소스 수동 감사. GPT 계보의 "데이터셋 구축이 곧 연구"([GPT-2](/papers/gpt-2/)의 WebText 정신)가 음성으로 온 것.

- **아키텍처는 의도적으로 평범하게**: 80채널 로그 멜(25ms/10ms — [신호처리 근간](/insight/audio-signal-fundamentals/)의 표준 그대로) → conv 2층 stem → [Transformer](/papers/transformer/) 인코더-디코더. tiny(39M)부터 large(1.55B)까지. 새 부품이 없어야 "데이터와 스케일의 효과"가 분리 측정된다는 실험 설계다.

- **다태스크를 토큰 시퀀스로**: 디코더 프롬프트의 특수 토큰들이 태스크를 지정한다 — `<|startoftranscript|>` → 언어 토큰(99종) → `<|transcribe|>`/`<|translate|>` → 타임스탬프 유무. 음성 활동 감지(무음 구간), 이전 문맥 조건화까지 전부 **하나의 토큰 인터페이스**로. 별도 헤드 없이 태스크를 시퀀스 형식으로 통일한 것은 T5/GPT식 문법의 음성판이다.

- **평가 프레임의 전환 — 유효 강건성**: LibriSpeech test-clean만 보면 제로샷 Whisper는 2.7 WER로 평범하다. 하지만 같은 clean 성능의 지도학습 모델들과 **12개 분포 밖 데이터셋**을 비교하면 — Whisper는 wav2vec 2.0 Large 대비 **평균 상대 오류 55.2% 감소**. 벤치마크 내 성능과 강건성이 전혀 다른 축임을 보이는, CLIP의 effective robustness 분석(같은 1저자다)의 음성 재연이다.

## 주요 결과

- 인간 전사자와의 비교: Kincaid46 부분집합에서 전문 전사자와 ~1% WER 이내 — "인간 수준 강건성"이 슬로건이 아니라 측정치다. 소음(pub noise, SNR<10dB)에서도 LibriSpeech 학습 모델 14종을 전부 앞선다.
- 다국어: MLS 7.3 WER(SOTA), CoVoST2 번역 29.1 BLEU(SOTA, 저자원 언어에서 +6.7). Fleurs에서 언어별 WER이 학습 데이터량과 강하게 상관($R^2 = 0.83$, 데이터 16배당 WER 절반) — 저자원·비인도유럽 문자 언어가 남은 숙제.
- 스케일링: 영어는 인간 수준 근처에서 포화가 보이지만 다국어·번역은 모델·데이터 스케일에 계속 반응. 다국어·다태스크 공동 학습은 작은 모델에선 음의 전이, **큰 모델에선 양의 전이** — 용량이 간섭을 시너지로 바꾼다.
- 한계도 명시: 자기회귀 디코딩의 환각(반복 루프, 무관 출력)과 그를 억누르는 디코딩 휴리스틱 뭉치(온도 스케줄, gzip 압축비 검사 등) — 이후 Whisper 계열 연구의 주요 개선 지점이 된다.

## 계보에서의 위치

[Deep Speech 2](/papers/deep-speech-2/)가 시작한 "스케일이 방법을 이긴다"를 두 자릿수 큰 데이터에서 완성하고, [wav2vec 2.0](/papers/wav2vec2/)/HuBERT의 자기지도 노선에 "약지도 + 제로샷"이라는 대안 축을 세운 논문이다. GPT-2·CLIP의 1저자 Alec Radford가 같은 설계 철학 — 평범한 아키텍처, 비범한 데이터, 제로샷 평가 — 을 텍스트, 이미지에 이어 음성에서 3연속으로 실행한 것이기도 하다. 공개 가중치 덕에 사실상의 오픈소스 ASR 표준이 되었고, 전사 도구를 넘어 음성 LLM들의 오디오 인코더로 흡수되며 "음성 인식 모델"에서 "음성 이해의 기반 부품"으로 위치가 이동 중이다.
