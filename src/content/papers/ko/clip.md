---
title: "CLIP: 자연어가 이미지 분류기의 라벨 공간이 되다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전-언어 모델
tags: ["컴퓨터 비전", "자연어 처리", "ICML", "OpenAI", "CLIP", "대조 학습", "제로샷", "멀티모달"]
paper: "Learning Transferable Visual Models From Natural Language Supervision"
paperUrl: "https://arxiv.org/abs/2103.00020"
authors: "Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, Ilya Sutskever"
venue: "ICML"
year: 2021
references: ["vit", "transformer", "simclr", "gpt-2"]
description: 웹에서 모은 4억 쌍의 (이미지, 텍스트)로 이미지 인코더와 텍스트 인코더를 대조 학습해, 배치 내 올바른 짝을 맞히는 사전학습만으로 임의의 분류 태스크를 프롬프트로 제로샷 수행한다. ImageNet 제로샷 76.2%로 지도학습 ResNet-50과 대등하며, 분포 이동 강건성에서 지도 모델을 압도한다.
---

## 한 줄 요약

비전 모델의 근본 제약은 "고정된 클래스 집합을 예측하도록 학습된다"는 것 — 새 개념마다 라벨링이 필요하다. CLIP은 웹의 (이미지, 캡션) 4억 쌍으로 **이미지 인코더와 텍스트 인코더가 올바른 짝을 맞히는 대조 학습**만 하고, 분류는 클래스 이름을 "A photo of a {label}"로 임베딩해 코사인 유사도로 고른다. 학습 예시 0장으로 ImageNet 76.2% — 지도학습 ResNet-50과 대등 — 이며, 분포가 바뀌었을 때는 오히려 지도 모델을 압도한다. **자연어가 라벨 공간을 대체한** 순간이다.

## 핵심 기여

- **대조가 예측을 이긴다**: 캡션을 그대로 생성/예측하는 목적함수는 비효율적이다 — bag-of-words 예측으로 바꾸면 3배, **대조 목적으로 바꾸면 추가 4배**(총 12배)의 제로샷 효율. 배치 $N$의 $N \times N$ 코사인 유사도 행렬에서 대각(진짜 짝)을 맞히는 대칭 교차엔트로피를, 학습되는 온도 $\tau$(초기 0.07)로 스케일해 최적화한다 — SimCLR의 InfoNCE가 "증강 뷰 쌍"에서 "이미지-텍스트 쌍"으로 무대를 옮긴 것.

- **WIT 400M**: Wikipedia 기반 50만 쿼리로 웹에서 수집, 쿼리당 최대 2만 쌍으로 균형화한 4억 쌍. GPT-2의 WebText에 준하는 단어량 — "데이터셋 구축 자체가 방법론"인 OpenAI 노선의 연장이다.

- **아키텍처**: 이미지 쪽은 개조 ResNet(attention pooling, antialiasing) 계열과 ViT-B/32, B/16, **L/14@336px**(최고 모델) — 같은 성능 기준 ViT가 ResNet보다 3배 계산 효율적이었다. 텍스트 쪽은 63M 12층 Transformer(BPE 49k, `[EOS]` 표현 사용). 양쪽을 선형 투영으로 공동 임베딩 공간에 맞춘다. ViT-L/14는 V100 256장 12일.

- **프롬프트 엔지니어링의 등장**: 클래스 이름만 넣는 것보다 "A photo of a {label}." 템플릿이 +1.3%, 80개 템플릿을 임베딩 공간에서 앙상블하면 +3.5% — 합쳐 ~5%. 도메인 힌트("a type of pet", "a satellite photo of...")도 유효하다. **분류기가 텍스트로 정의되는 순간, 분류기 설계가 프롬프트 설계가 된다** — GPT-3의 프롬프팅과 정확히 같은 전환이 비전에서 일어난 것.

## 주요 결과

- **제로샷**: ImageNet **76.2%**(지도 ResNet-50과 동급), 27개 데이터셋 중 16개에서 ResNet-50 linear probe를 이긴다. 제로샷이 같은 특징의 4-shot 회귀와 맞먹는다는 관찰도 흥미롭다(자연어로 개념을 "직접 지정"하는 것의 정보량).
- **표현 학습**: linear probe에서 ViT-L/14@336px가 Noisy Student EfficientNet-L2를 27개 중 21개 데이터셋에서 상회. 특히 행동 인식에서 큰 격차(Kinetics700 +14.5%) — 자연어 감독이 동사를 가르친다.
- **강건성이 백미**: ImageNetV2/Sketch/ObjectNet/ImageNet-A/R 등 7개 자연 분포 이동에서, 같은 ImageNet 정확도의 지도 모델 대비 강건성 격차를 **최대 75% 축소**. ImageNet에 미세조정하면 ImageNet은 +9.2% 오르지만 강건성 이득은 사라진다 — "특정 분포에의 적합이 강건성을 깎는다"는 교훈.
- **한계도 정직하다**: 세분류(자동차, 항공기)와 계수, 위성·의료 등 전문 도메인에서 약하고, MNIST조차 픽셀 로지스틱 회귀에 진다(웹 분포 밖). 제로샷 SOTA까지는 ~1000배 계산이 더 필요하다는 추정, FairFace 편향 분석과 감시 응용 우려까지 명시했다.

## 계보에서의 위치

[SimCLR](/papers/simclr/)의 대조 손실, [ViT](/papers/vit/)/[Transformer](/papers/transformer/)의 인코더, 그리고 [GPT-2](/papers/gpt-2/)의 "태스크를 자연어로 지정한다"는 사상이 한 점에서 만난 논문이다(1저자 Alec Radford가 GPT 계보와 동일 인물이라는 것은 우연이 아니다). 이후의 파급이 방대하다: 오픈 재현(OpenCLIP, LAION), 제로샷 분류·검색의 표준화, DALL·E 2/Stable Diffusion의 텍스트 조건화, 그리고 LLaVA류 멀티모달 LLM의 비전 인코더까지 — 2020년대 멀티모달의 공용 기반이 됐다. 손실 설계의 다음 논쟁(softmax의 배치 결합을 끊을 수 있는가)은 SigLIP이 잇는다.
