---
title: "ViT: 이미지는 16×16 단어들이다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전 트랜스포머
tags: ["컴퓨터 비전", "ICLR", "Google Research", "ViT", "Transformer", "ImageNet"]
paper: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
paperUrl: "https://arxiv.org/abs/2010.11929"
authors: "Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, Neil Houlsby"
venue: "ICLR"
year: 2021
references: ["transformer", "bert", "resnet"]
description: 이미지를 16×16 패치 시퀀스로 잘라 표준 Transformer 인코더에 그대로 넣는 Vision Transformer를 제안한다. ImageNet만으로는 ResNet에 밀리지만 JFT-300M 사전학습에서는 압도한다 — 데이터가 충분하면 대규모 학습이 CNN의 inductive bias를 이긴다는 것이 핵심 논지다.
---

## 한 줄 요약

이미지를 16×16 패치로 잘라 각 패치를 토큰처럼 선형 투영하면, **아무 수정 없는 표준 Transformer 인코더**가 이미지 분류를 할 수 있다. 작은 데이터에서는 CNN의 inductive bias(국소성, 등변성)를 못 이기지만, 사전학습 데이터가 ImageNet → ImageNet-21k → JFT-300M으로 커질수록 형세가 역전된다 — "**대규모 학습이 inductive bias를 이긴다**"는 이 한 문장이 컴퓨터 비전의 백본을 교체했다.

## 핵심 기여

- **이미지의 토큰화**: $H \times W \times C$ 이미지를 $P \times P$ 패치 $N = HW/P^2$개로 잘라 평탄화하고 선형 투영 $E$로 임베딩한다. BERT의 `[CLS]`를 그대로 가져온 학습형 class 토큰을 앞에 붙이고, 학습형 1D 위치 임베딩을 더한다.

$$z_0 = [x_{class};\ x_p^1 E;\ x_p^2 E;\ \dots;\ x_p^N E] + E_{pos}$$

  이후는 [Transformer](/papers/transformer/) 인코더 그대로이고, class 토큰의 최종 표현에 분류 head를 얹는다. 비전 특화 설계를 **의도적으로 최소화**한 것이 논문의 실험 설계다.

- **Inductive bias의 관점**: CNN은 국소성·평행이동 등변성·2차원 이웃 구조가 모든 층에 내장돼 있지만, ViT에서 이미지다운 가정은 패치 절단과 해상도 조정 시의 위치 임베딩 보간뿐이다 — 공간 관계를 전부 **데이터에서 배워야** 한다. 이것이 약점이자(소데이터에서 패배) 강점(대데이터에서 더 높은 천장)이라는 것이 논지의 축이다. CNN feature map을 입력으로 쓰는 하이브리드도 실험했는데, 규모가 커지면 순수 ViT가 따라잡는다.

- **모델 패밀리**: BERT 구성을 그대로 미러링 — ViT-Base(12층/768/12헤드, 86M), Large(24층/1024/16헤드, 307M), Huge(32층/1280/16헤드, 632M). 표기 ViT-L/16의 숫자는 패치 크기 — 패치가 작을수록 시퀀스가 길어져 계산이 늘지만 정확해진다.

## 주요 결과

- **데이터 스케일이 승부를 가른다**: ImageNet(1.3M)만으로는 ViT가 동급 ResNet에 밀리고, ImageNet-21k(14M)에서 대등, JFT-300M에서 역전. 작은 데이터에서는 큰 ViT가 작은 ViT보다도 나쁘다 — 정규화가 아니라 데이터가 병목이라는 뜻.
- JFT-300M 사전학습 ViT-H/14: ImageNet **88.55%**, ImageNet-ReaL 90.72%, CIFAR-100 94.55%, VTAB(19태스크) 77.63% — 당시 SOTA인 BiT-L(ResNet152x4)을 전 항목에서 상회.
- **계산 효율**: 같은 성능 기준 BiT ResNet 대비 사전학습 연산 **2~4배 절감**. self-attention의 $O(n^2)$에도 불구하고, 패치 시퀀스가 짧아(224px/16 = 14×14 = 196토큰) 실제로는 유리하다.
- **분석**: 학습된 1D 위치 임베딩이 스스로 2차원 격자 구조(행·열 유사성)를 복원하고, 낮은 층에서도 일부 헤드는 전역을 본다(CNN에서는 불가능한 접근) — 깊어질수록 평균 attention 거리가 늘어 CNN의 수용 영역 성장과 유사한 패턴. BERT식 masked patch prediction 자기지도 사전학습도 예비 실험(ViT-B/16, 79.9% — 지도 대비 -4%)으로 남겨, MAE가 풀 숙제를 예고했다.

## 계보에서의 위치

NLP의 [BERT](/papers/bert/)식 "대규모 사전학습 + 미세조정" 레시피와 [Transformer](/papers/transformer/) 아키텍처를 비전에 최소 수정으로 이식해, AlexNet 이후 8년 만에 백본의 세대교체를 일으킨 논문이다. [ResNet](/papers/resnet/)까지의 CNN 계보가 쌓아온 inductive bias를 "데이터로 대체 가능한 것"으로 상대화했다는 점이 사상적 기여다. 남긴 숙제도 명확했다: JFT-300M 없이 학습하는 법(DeiT의 증류), 고해상도·dense 태스크를 위한 계층 구조(Swin), 그리고 자기지도 사전학습(MAE, DINO) — 이후 비전 시리즈 전체가 이 세 갈래의 전개다.
