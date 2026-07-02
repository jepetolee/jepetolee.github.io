---
title: "DINOv3: Gram anchoring으로 7B 자기지도 비전 모델을 완성하다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 자기지도학습
tags: ["컴퓨터 비전", "Meta AI", "DINOv3", "자기지도학습", "파운데이션 모델"]
paper: "DINOv3"
paperUrl: "https://arxiv.org/abs/2508.10104"
authors: "Oriane Siméoni, Huy V. Vo, Maximilian Seitzer, et al. (Meta AI Research)"
venue: "arXiv"
year: 2025
references: ["dinov2", "dino"]
description: 자기지도 비전 모델을 ViT-7B와 17억 장 큐레이션 데이터로 스케일링하며, 장기 학습에서 dense feature가 열화되는 문제를 초기 체크포인트의 Gram 행렬에 패치 특징을 정박시키는 Gram anchoring으로 해결한다. frozen backbone만으로 분할·깊이·대응 등 dense 태스크에서 자기·약지도 모델 전부를 크게 앞선다.
---

## 한 줄 요약

자기지도 비전 모델을 계속 키우면 이상한 일이 생긴다 — 전역 성능(분류)은 계속 오르는데 **dense 성능(분할, 깊이)은 20만 스텝 이후 오히려 열화**된다. 패치 토큰들이 CLS에 끌려가 국소성을 잃기 때문이다. DINOv3의 해법은 **Gram anchoring**: 학생의 패치 간 유사도 구조(Gram 행렬)를 아직 국소성이 살아 있던 초기 체크포인트의 것에 정박시킨다. 이로써 7B ViT + 17억 장 학습이 성립하고, frozen backbone만으로 dense 태스크 전반에서 CLIP 계열과 DINOv2를 모두 크게 앞지른다.

## 핵심 기여

- **스케일**: 교사 ViT-7B(40블록, 임베딩 4096, 패치 16 — DINOv2의 ~6배), 데이터는 Instagram 170억 장에서 계층적 k-means로 다양성을 확보한 LVD-1689M + 검색 기반 큐레이션 + ImageNet(매 스텝 10%는 ImageNet1k 균질 배치를 섞는 혼합 전략). 배치 4096 × 256 GPU × 1M 스텝. 사전학습 손실은 DINOv2를 계승: $\mathcal{L} = \mathcal{L}_{DINO} + \mathcal{L}_{iBOT} + 0.1\,\mathcal{L}_{Koleo}$.

- **Gram anchoring — dense 열화의 처방**: 패치 특징의 절대값이 아니라 **패치 간 관계 구조**를 보존한다. $\ell_2$ 정규화된 학생 패치 특징 $X_S$와 초기 "Gram 교사" 체크포인트의 $X_G$에 대해

$$\mathcal{L}_{Gram} = \left\| X_S X_S^T - X_G X_G^T \right\|_F^2$$

  Gram 행렬만 맞추므로 특징 자체는 계속 진화할 자유가 있다 — 전역 표현의 개선과 국소 구조의 보존이 분리된다. 정제 단계(1M 스텝 이후)에 적용하고 Gram 교사는 10k마다 갱신. 변형으로 Gram 교사에 2배 해상도 이미지를 넣고 특징을 다운샘플해 타깃으로 쓰면 ADE20k +2 mIoU 추가.

- **학습 공학**: 좌표를 $[-1,1]$로 정규화한 커스텀 **RoPE** + 좌표 스케일을 $[0.5, 2]$로 흔드는 jittering(해상도 강건성), cosine 스케줄 전폐(**상수** lr/wd/EMA — 스케일에서 스케줄 튜닝을 제거), 마지막 고해상도 적응 단계(global 512~768px).

- **멀티 학생 증류와 텍스트 정렬**: 교사 추론 비용을 GPU 그룹 간에 공유하며 ViT-S/S+/B/L/H+를 **동시에** 증류 — ViT-L이 7B 성능의 대부분을 1/23 파라미터로 낸다. LiT 방식(frozen 비전 + 텍스트 인코더 학습)의 dino.txt로 제로샷 용도까지 커버.

## 주요 결과 (전부 frozen backbone)

- **Dense**: ADE20k linear **55.9 mIoU**(DINOv2 49.5, SAM 증류 계열 AM-RADIO 53.0), Cityscapes 81.1, NYUv2 깊이 RMSE 0.309(DINOv2 0.372), DAVIS 추적 83.3 J&F(76.6), 3D 대응 NAVI 64.4% — **10 mIoU급 격차로 약지도(CLIP/SigLIP2) 모델들을 앞선다.**
- 태스크 head를 얹으면 COCO 검출 66.1 mAP, ADE20k 63.0 mIoU — 백본 미세조정 없이 SOTA급.
- **전역**: ImageNet-1k linear 88.2%로 약지도 최고 모델들과 대등 — dense를 얻으며 전역을 희생하지 않았다.
- 위성 영상 등 타 도메인 전이에서도 기존 접근 상회 — "라벨도 캡션도 없는 사전학습"의 도메인 이식성.

## 계보에서의 위치

[DINO](/papers/dino/)의 창발(attention=분할) → [DINOv2](/papers/dinov2/)의 파운데이션화 → DINOv3의 "스케일에서 dense 품질을 지키는 법"으로 이어지는 3부작의 완결편이다. 발견된 문제(전역-국소의 긴장)와 처방(관계 구조의 정박)은 자기지도 스케일링의 일반 교훈으로 읽힌다 — 손실이 최적화하는 것과 우리가 원하는 표현이 갈라질 때, 무엇을 고정해야 하는가. 포지셔닝도 선명해졌다: 언어 정렬이 필요하면 CLIP/SigLIP 계열, **시각 구조 그 자체**가 필요하면 DINOv3 — 그리고 후자는 이제 전자의 아성이던 전역 분류에서도 대등하다.
