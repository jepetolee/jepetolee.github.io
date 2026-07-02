---
title: "Swin Transformer: 이동 윈도우로 계층적 백본을 되찾다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전 트랜스포머
tags: ["컴퓨터 비전", "ICCV", "Microsoft Research", "Swin Transformer", "Transformer", "객체 검출"]
paper: "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows"
paperUrl: "https://arxiv.org/abs/2103.14030"
authors: "Ze Liu, Yutong Lin, Yue Cao, Han Hu, Yixuan Wei, Zheng Zhang, Stephen Lin, Baining Guo"
venue: "ICCV"
year: 2021
references: ["vit"]
description: 어텐션을 7×7 국소 윈도우 안으로 제한해 복잡도를 이미지 크기에 선형으로 만들고, 블록마다 윈도우를 반 칸 이동시켜 윈도우 간 정보를 섞는다. patch merging으로 CNN식 4단계 계층 feature를 복원해, 분류를 넘어 COCO 검출과 ADE20K 분할까지 전 태스크 SOTA를 달성한 범용 백본이다.
---

## 한 줄 요약

ViT는 분류엔 좋지만 범용 백본으로는 두 가지가 아쉽다 — 단일 저해상도(16×) feature map뿐이라 검출·분할의 FPN에 못 꽂히고, 전역 어텐션의 $O((hw)^2)$ 복잡도가 고해상도에서 터진다. Swin은 어텐션을 **국소 윈도우 안으로** 제한하고(선형 복잡도), 블록마다 윈도우를 **반 칸씩 이동**시켜 윈도우 간 연결을 만들며, patch merging으로 **CNN식 계층 구조(4×/8×/16×/32×)**를 복원한다 — Transformer를 "분류 모델"에서 "범용 비전 백본"으로 승격시킨 논문(ICCV 2021 best paper).

## 핵심 기여

- **계층적 구조**: 4×4 패치로 시작해(56×56 토큰) stage마다 2×2 이웃 패치를 이어붙이는 patch merging으로 토큰을 1/4로 줄이고 채널을 2배로 — 정확히 CNN 백본의 피라미드다. 덕분에 FPN, U-Net 등 기존 dense prediction 프레임에 **교체형 백본**으로 그대로 들어간다.

- **윈도우 어텐션(W-MSA)의 산수**: $M \times M$($M=7$) 비중첩 윈도우 안에서만 어텐션을 계산하면

$$\Omega(\text{MSA}) = 4hwC^2 + 2(hw)^2 C \quad \to \quad \Omega(\text{W-MSA}) = 4hwC^2 + 2M^2 hwC$$

  제곱항의 $hw$가 상수 $M^2$으로 바뀌어 **이미지 크기에 선형**이 된다.

- **이동 윈도우(SW-MSA)**: 윈도우를 고정하면 윈도우 사이에 정보가 영영 안 섞인다. 연속한 블록에서 윈도우 분할을 $\lfloor M/2 \rfloor$만큼 이동시켜 이전 블록의 윈도우 경계를 가로지르게 한다. 이동으로 윈도우 수가 늘어나는 문제는 **cyclic shift + 마스킹**으로 해결 — 패딩 방식 대비 13~18% 빠르다. ablation이 가치를 증명한다: 이동을 빼면 ImageNet -1.1%p, COCO box AP **-2.8** — 분류보다 dense 태스크에서 훨씬 크게 무너진다.

- **상대 위치 바이어스**: 어텐션에 학습형 상대 위치 항을 더한다 — $\text{Attention}(Q,K,V) = \text{softmax}(QK^T/\sqrt{d} + B)V$, $B$는 $(2M-1) \times (2M-1)$ 테이블에서 인덱싱. ViT의 절대 위치 임베딩보다 낫고, 제거 시 분류 -1.2%p, 분할 -2.3 mIoU.

- **패밀리**: Swin-T(29M, 4.5G — ResNet-50급)부터 Swin-L(197M)까지, stage 깊이 {2,2,6,2}~{2,2,18,2}.

## 주요 결과

- ImageNet-1k: Swin-L(384px, ImageNet-22k 사전학습) **87.3%**. 같은 급의 DeiT/ViT를 계산량 대비 일관되게 상회.
- **COCO 검출: 58.7 box AP / 51.1 mask AP** — 종전 SOTA +2.7/+2.6. ADE20K 분할 **53.5 mIoU**(+3.2). 백본만 Swin으로 바꾸는 것으로 얻은 수치라는 점이 핵심이다.
- 국소 윈도우 + 이동이라는 구조는 결과적으로 CNN의 국소성 bias를 어텐션 프레임 안에서 재도입한 것 — "bias를 버린" ViT와 "bias를 되찾은" Swin 사이의 긴장이 이후 논쟁(ConvNeXt: "그럼 CNN도 레시피만 좋으면 되지 않나")의 소재가 된다.

## 계보에서의 위치

[ViT](/papers/vit/)가 분류에서 백본 교체를 선언했다면, Swin은 검출·분할까지 포함한 **전 태스크에서** 그 교체를 완성했다. 계층 구조와 선형 복잡도라는 설계는 CNN 시대의 자산(피라미드, 국소성)을 어텐션 문법으로 번역한 것이고, 이 절충이 실전에서 압도적으로 유효함을 보였다. 후속 Swin V2는 이 구조를 3B 파라미터·1536px 해상도로 스케일링하며 학습 안정성 문제를 다룬다.
