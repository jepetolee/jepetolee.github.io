---
title: "Swin V2: 3B 파라미터, 1536px — 비전 백본 스케일링의 공학"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 비전 트랜스포머
tags: ["컴퓨터 비전", "CVPR", "Microsoft Research", "Swin Transformer", "Transformer", "스케일링 법칙"]
paper: "Swin Transformer V2: Scaling Up Capacity and Resolution"
paperUrl: "https://arxiv.org/abs/2111.09883"
authors: "Ze Liu, Han Hu, Yutong Lin, Zhuliang Yao, Zhenda Xie, Yixuan Wei, Jia Ning, Yue Cao, Zheng Zhang, Li Dong, Furu Wei, Baining Guo"
venue: "CVPR"
year: 2022
references: ["swin"]
description: 비전 Transformer를 3B 파라미터와 1536px 해상도로 키울 때 만나는 세 가지 벽 — 깊은 층 활성 폭주, 사전학습-미세조정 해상도 격차, GPU 메모리 — 을 res-post-norm, scaled cosine attention, 로그 간격 연속 위치 바이어스로 해결한다. SwinV2-G는 COCO 63.1 AP, ADE20K 59.9 mIoU 등 4개 벤치마크 SOTA를 갱신했다.
---

## 한 줄 요약

NLP는 모델을 수천억 파라미터까지 키웠는데 비전은 왜 못 키우나 — 해보니 세 가지 벽이 있었다: (1) 커질수록 깊은 층의 활성 크기가 얕은 층의 $10^4$배까지 폭주해 학습이 터지고, (2) 저해상도 사전학습 모델을 고해상도로 옮기면 윈도우 크기가 바뀌어 성능이 무너지며, (3) 메모리가 감당이 안 된다. Swin V2는 이 셋을 각각 정규화 위치, 어텐션 유사도 함수, 위치 바이어스의 매개화로 풀고, **3B 파라미터 SwinV2-G**로 4개 벤치마크 SOTA를 갱신했다 — 아이디어 논문이 아니라 스케일링 공학 논문이다.

## 핵심 기여

- **Res-post-norm**: pre-norm 구조에서는 각 블록의 출력이 정규화 없이 main branch에 직접 더해져 활성이 층마다 누적 증폭된다. LayerNorm을 residual 유닛의 **뒤**(덧셈 직전)로 옮기면 매 블록의 기여가 정규화된 채 합류해 활성 크기가 완만해진다 — 대형 모델 학습 안정성의 첫 번째 열쇠.

- **Scaled cosine attention**: 큰 모델에서 일부 헤드의 어텐션이 소수 픽셀 쌍에 지배되는 문제를, 내적을 코사인 유사도로 바꿔 해결한다.

$$\text{Sim}(q_i, k_j) = \frac{\cos(q_i, k_j)}{\tau} + B_{ij}$$

  $\tau$는 층·헤드별 학습 스칼라(하한 0.01). 코사인은 자체 정규화되어 있어 활성 크기와 무관하게 어텐션 분포가 완만해진다. res-post-norm과 합쳐 base 모델에서도 +0.5%p, 대형 모델에서는 학습 가능/불가능을 가른다.

- **로그 간격 연속 위치 바이어스(Log-CPB)**: Swin V1의 위치 바이어스는 $(2M-1)^2$ 테이블이라 윈도우 크기가 바뀌면 보간해야 하고 성능이 깎인다. V2는 상대 좌표를 입력받아 바이어스를 **생성하는 작은 메타 망** $B(\Delta x, \Delta y) = \mathcal{G}(\Delta x, \Delta y)$를 두되, 좌표를 로그 간격으로 변환한다.

$$\widehat{\Delta x} = \text{sign}(\Delta x) \cdot \log(1 + |\Delta x|)$$

  8×8→16×16 윈도우 전이 시 외삽 범위가 선형 좌표 대비 ~4배 줄어, **미세조정 없이도** 윈도우 크기를 옮길 수 있다. 8×8→24×24 전이에서 선형 CPB 대비 +10%p가 넘는 차이.

- **메모리와 데이터의 공학**: ZeRO로 옵티마이저 상태 분산, activation checkpointing(~30% 감속), 초기 stage의 순차 어텐션으로 1536×1536 학습을 성사시켰다. 데이터 쪽은 SimMIM(masked image modeling) 자기지도 사전학습으로 보충 — 7천만 장 라벨 데이터로, 수십억 장을 쓴 Google의 billion-scale 모델 대비 **40배 적은 라벨**로 도달했다.

## 주요 결과

- SwinV2-G(3.0B): ImageNet-1k **90.17%**, ImageNet-V2 84.0%, COCO **63.1/54.4 AP**(+1.8/+1.4), ADE20K **59.9 mIoU**(+1.5), Kinetics-400 86.8% — 분류·검출·분할·비디오 4관왕.
- 각 부품의 ablation이 독립적으로 유효: 특히 위치 바이어스 개선은 "저해상도로 사전학습하고 고해상도로 쓰는" 실무 파이프라인의 비용을 직접 줄인다.

## 계보에서의 위치

[Swin](/papers/swin/)이 구조를 제시했다면 V2는 그 구조를 **스케일이 견디게** 만든 후속이다. NLP의 [Scaling Laws](/papers/scaling-laws/) 이후 "비전도 키우면 되는가"라는 질문에 대해, 크기·해상도·데이터의 세 축에서 병목을 하나씩 제거하며 "된다, 단 공학이 필요하다"고 답했다. 여기서 정리된 기법들(post-norm 계열 안정화, 코사인/정규화 어텐션, 외삽 가능한 위치 인코딩)은 이후 대형 비전·멀티모달 모델 학습의 상비 도구가 됐고, 자기지도 사전학습으로 라벨 병목을 우회하는 노선은 MAE·DINO 계열과 합류한다.
