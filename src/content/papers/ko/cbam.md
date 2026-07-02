---
title: "CBAM: 무엇을 볼지, 어디를 볼지 — 채널과 공간의 이중 어텐션"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 합성곱 신경망
tags: ["컴퓨터 비전", "인공신경망", "ECCV", "CBAM", "어텐션", "CNN"]
paper: "CBAM: Convolutional Block Attention Module"
paperUrl: "https://arxiv.org/abs/1807.06521"
authors: "Sanghyun Woo, Jongchan Park, Joon-Young Lee, In So Kweon"
venue: "ECCV"
year: 2018
references: ["senet", "resnet"]
description: SE의 채널 어텐션에 공간 어텐션을 직렬로 추가한 경량 모듈을 제안한다. 채널 축에서는 avg+max 이중 풀링과 공유 MLP로 "무엇을", 공간 축에서는 채널 방향 풀링과 7×7 conv로 "어디를" 강조하며, 채널→공간 순서가 최적임을 ablation으로 보였다.
---

## 한 줄 요약

SE 블록이 "**무엇**(어떤 채널)이 중요한가"만 물었다면, CBAM은 "**어디**(어떤 위치)가 중요한가"를 함께 묻는다 — 채널 어텐션과 공간 어텐션을 직렬로 배치하고, 각각에서 평균 풀링과 최대 풀링을 상보적으로 결합한 경량 모듈. SE보다 일관되게 좋고, 여전히 어느 CNN에나 꽂을 수 있는 플러그인이다. KAIST 주도 연구라는 점도 기록해둘 만하다.

## 핵심 기여

- **채널 어텐션 — avg와 max의 상보성**: SE의 평균 풀링에 최대 풀링을 추가한다. 평균이 전역 통계라면 최대는 "가장 두드러진 부분의 정도"를 인코딩한다는 논리. 두 서술자를 **공유 MLP**(축소비 $r=16$)에 각각 통과시켜 더한다.

$$M_c(F) = \sigma\!\left( \text{MLP}(\text{AvgPool}(F)) + \text{MLP}(\text{MaxPool}(F)) \right)$$

  ablation에서 avg 단독(=SE와 동일 구성)보다 avg+max가 명확히 좋았다(ResNet-50 top-1 오류 23.14→22.80).

- **공간 어텐션 — 채널을 접어 위치를 본다**: 채널 **축을 따라** avg/max 풀링해 얻은 2D 맵 두 장을 이어붙이고, 넓은 문맥을 위해 7×7 conv를 통과시킨다.

$$M_s(F) = \sigma\!\left( f^{7 \times 7}\!\left( [\text{AvgPool}(F); \text{MaxPool}(F)] \right) \right)$$

- **직렬, 채널 먼저**: 전체 흐름은 $F' = M_c(F) \otimes F$, $F'' = M_s(F') \otimes F'$. 배치 방식을 전부 비교한 결과 병렬(22.95)보다 직렬(22.66)이, 공간 우선(22.78)보다 **채널 우선**(22.66)이 좋았다 — "무엇인지 정한 뒤 어디인지 본다"는 순서가 실험적으로 최적.

- **오버헤드**: ResNet-50 기준 GFLOPs 3.858→3.864. SE와 같은 급의 플러그인 비용으로 공간 축까지 커버한다.

## 주요 결과

- ImageNet top-1 오류: ResNet-50 24.56 → SE 23.14 → **CBAM 22.66**, ResNet-101 23.38 → SE 22.35 → **CBAM 21.51**. WideResNet, ResNeXt, MobileNet에서도 일관된 개선.
- 검출 전이: COCO Faster R-CNN(ResNet-101) mAP@[.5,.95] 29.1→**30.8**, VOC 2007 StairNet(VGG16) 79.3 mAP.
- **Grad-CAM 검증**: CBAM을 단 망의 Grad-CAM이 대상 물체 영역에 더 밀집되게 집중한다 — 어텐션 모듈이 실제로 "올바른 곳"을 보게 만든다는 정성적 증거로, 해석 도구(Grad-CAM)를 아키텍처 평가에 쓴 좋은 사례다.

## 계보에서의 위치

[SENet](/papers/senet/)이 연 "feature 재보정" 노선을 채널+공간 2축으로 완성한 모듈이다. conv feature map의 세 축(채널, 높이, 너비) 중 SE가 채널만 게이팅했다면 CBAM은 나머지 공간 축을 마저 게이팅했고, 이로써 conv 프레임 안에서의 어텐션 문법은 사실상 완결된다. 이 다음 단계는 게이팅(어디를 강조할까)을 넘어 **샘플링 위치 자체를 바꾸는** Deformable Convolution, 그리고 축의 구분 없이 모든 위치 쌍의 관계를 직접 계산하는 self-attention([ViT](/papers/vit/))이다 — CBAM은 그 전환 직전, "가벼운 어텐션"의 정점에 있다.
