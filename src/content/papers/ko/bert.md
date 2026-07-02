---
title: "BERT: 마스킹으로 모든 층을 양방향으로 사전학습하다"
date: 2026-07-02
draft: false
category: 자연어 처리
subcategory: 언어 모델
tags: ["자연어 처리", "NAACL", "Google Research", "BERT", "사전학습", "언어 모델"]
paper: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
paperUrl: "https://arxiv.org/abs/1810.04805"
authors: "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova"
venue: "NAACL"
year: 2019
references: ["transformer", "elmo", "gpt-1"]
description: 토큰의 15%를 가리고 원래 토큰을 맞히는 Masked LM으로, 좌우 문맥을 모든 층에서 동시에 조건화하는 깊은 양방향 Transformer 인코더를 사전학습한다. 출력층 하나만 얹는 미세조정으로 GLUE, SQuAD 등 11개 태스크의 SOTA를 갈아치웠다.
---

## 한 줄 요약

GPT-1은 좌→우 단방향이라 각 토큰이 자기 왼쪽만 볼 수 있고, ELMo의 양방향성은 독립적으로 학습한 두 단방향 LM의 얕은 연결(shallow concatenation)에 그친다. BERT는 표준 LM 목적함수를 포기하고 **빈칸 맞히기(Masked LM)**로 바꿈으로써, 좌우 문맥을 **모든 층에서 동시에** 조건화하는 깊은 양방향 Transformer 인코더를 사전학습한다. 그 대가로 생성 능력을 잃었지만, 이해(understanding) 태스크에서는 출력층 하나만 얹은 미세조정으로 11개 벤치마크를 쓸어 담았다.

## 핵심 기여

- **Masked LM (MLM)**: 입력 토큰의 15%를 무작위로 선택해 원래 토큰을 맞히게 한다. 단순히 전부 `[MASK]`로 바꾸면 미세조정 시엔 `[MASK]`가 등장하지 않아 사전학습-미세조정 불일치가 생기므로, 선택된 토큰의 **80%만 `[MASK]`, 10%는 무작위 토큰, 10%는 원래 토큰 유지**로 치환한다 — 모델이 모든 입력 토큰의 문맥 표현을 유지하도록 강제하는 장치다. 양방향 조건화는 표준 LM으로는 불가능하다(각 단어가 간접적으로 자기 자신을 보게 되므로), 마스킹이 이를 우회한다.

- **Next Sentence Prediction (NSP)**: 문장 쌍 관계(QA, NLI)를 위해, 50%는 실제 다음 문장, 50%는 무작위 문장을 붙여 `[CLS]` 표현으로 이진 분류를 함께 사전학습한다.

- **아키텍처와 입력 표현**: Transformer **인코더** 스택 — BERT-base 12층/768/12헤드(110M, GPT-1과 크기를 맞춘 비교용), BERT-large 24층/1024/16헤드(340M). 입력은 WordPiece 30k 임베딩 + 학습형 위치 임베딩 + 문장 A/B를 구분하는 segment 임베딩의 합이고, 분류용 `[CLS]`와 구분자 `[SEP]`를 쓴다. 하나의 입력 형식으로 단일 문장과 문장 쌍을 모두 표현해, 태스크별 입력 변환조차 최소화했다.

- **사전학습 → 미세조정**: BooksCorpus 800M + 영어 Wikipedia 2,500M 단어, 배치 256으로 1M스텝(~40에폭). 미세조정은 태스크마다 출력층 하나를 추가하고 전체를 2~4에폭 학습하는 게 전부다(배치 16~32, lr 2e-5~5e-5) — TPU 1시간, GPU 몇 시간 수준.

## 주요 결과

- **GLUE 80.5** — 이전 최고 대비 +7.7%p 절대 개선. MNLI 86.7%.
- **SQuAD v1.1 F1 93.2**(TriviaQA 보조 데이터 포함 앙상블), v2.0 F1 83.1, SWAG 86.3%.
- **Ablation이 논지를 그대로 증명**: 같은 데이터·크기에서 좌→우 LM(LTR & No NSP)으로 바꾸면 MRPC 77.5(vs 86.7), SQuAD 77.8(vs 88.5)로 폭락 — 양방향성이 핵심임을 보인다. NSP 제거는 QNLI -3.5%p 등.
- **크기 효과**: 모델을 키울수록 3.6k 예시짜리 소형 데이터셋(MRPC)까지 포함해 전 태스크가 일관되게 개선 — "충분히 사전학습되면 극소 데이터 태스크도 큰 모델의 덕을 본다"는, 스케일링 시대를 예고하는 관찰.
- feature-based로 써도(마지막 4개 층 연결) NER F1 96.1로 미세조정(96.6)에 근접 — ELMo식 사용법도 지원됨을 확인.

## 계보에서의 위치

[Transformer](/papers/transformer/)의 인코더 절반을 가져와, [GPT-1](/papers/gpt-1/)의 "사전학습+미세조정" 레시피와 [ELMo](/papers/elmo/)의 "양방향 문맥" 아이디어를 하나로 합친 종합이다. 발표 직후 수년간 NLU의 기본값이 되었고(RoBERTa, ALBERT, ELECTRA 등 후속 개량과 'BERTology'라는 분석 분야까지 낳았다), 인코더 계열과 디코더 계열(GPT)의 분기점을 만들었다. 이 분기는 T5가 "전부 text-to-text로 통일하면?"이라는 질문으로 다시 봉합을 시도하고, 궁극적으로는 스케일과 생성 능력을 앞세운 디코더 계열이 주류가 되면서 정리된다 — 하지만 검색, 분류, 임베딩 모델의 세계에서 BERT의 후손들은 여전히 현역이다.
