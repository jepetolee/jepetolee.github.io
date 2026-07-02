---
title: "ArcFace: 각도 마진으로 임베딩 사이를 벌리다"
date: 2026-07-02
draft: false
category: 컴퓨터 비전
subcategory: 얼굴 인식
tags: ["컴퓨터 비전", "CVPR", "ArcFace", "AAM-softmax", "얼굴 인식", "메트릭 러닝", "화자 인식"]
paper: "ArcFace: Additive Angular Margin Loss for Deep Face Recognition"
paperUrl: "https://arxiv.org/abs/1801.07698"
authors: "Jiankang Deng, Jia Guo, Niannan Xue, Stefanos Zafeiriou"
venue: "CVPR"
year: 2019
references: ["resnet"]
description: 임베딩과 클래스 가중치를 정규화해 로짓을 각도의 코사인으로 환원하고, 정답 클래스의 각도에 가산 마진 m을 더하는 additive angular margin(AAM) softmax를 제안한다. 초구면 위 측지 거리에 정확히 대응하는 마진으로 얼굴 인식 벤치마크를 석권했고, 이후 화자 검증 임베딩 학습의 표준 손실로 이식됐다.
---

## 한 줄 요약

open-set 인식(학습에 없던 인물/화자의 검증)에서 softmax의 약점은 명확하다 — 클래스를 **분리**만 하면 손실이 내려가므로, 클래스 간 결정 경계 근처에 임베딩이 몰려 있어도 벌점이 없다. ArcFace는 임베딩과 가중치를 정규화해 로짓을 순수 각도 문제로 만들고, 정답 클래스의 각도에 **가산 마진 $m$을 더해** $\cos(\theta_{y_i} + m)$으로 학습한다 — 마진이 초구면 위의 측지 거리와 정확히 일치하는, 기하적으로 가장 깨끗한 마진 softmax다. 얼굴 인식에서 태어나 화자 인식의 표준 손실(AAM-softmax)이 된 손실 함수.

## 핵심 기여

- **로짓의 각도 환원**: $W_j^T x_i = \|W_j\| \|x_i\| \cos\theta_j$에서 $\|W_j\| = 1$, $\|x_i\| = s$로 정규화하면 로짓은 $s\cos\theta_j$ — 예측이 오직 **특징과 클래스 중심 사이의 각도**로 결정된다. 클래스 가중치 $W_j$가 곧 그 클래스의 중심 방향이 된다.

- **AAM 손실**: 정답 클래스의 각도에만 마진을 더한다.

$$L = -\log \frac{e^{s \cos(\theta_{y_i} + m)}}{e^{s \cos(\theta_{y_i} + m)} + \sum_{j \neq y_i} e^{s \cos\theta_j}}, \qquad s = 64,\ m = 0.5$$

  같은 클래스는 중심 주위 $m$ 이내로 뭉치고, 다른 클래스 중심과는 최소 $m$의 각도 간격이 강제된다 — **클래스 내 응집(intra-class compactness)과 클래스 간 분리(inter-class discrepancy)를 동시에** 최적화하는 것.

- **마진 3형제의 통일**: 선행 마진들을 $\cos(m_1 \theta + m_2) - m_3$ 프레임으로 통일해 비교한다 — SphereFace는 곱셈 마진 $m_1$(정수 근사가 필요하고 수렴이 불안정), CosFace는 코사인 마진 $m_3$(각도 공간에서 보면 비선형 마진), ArcFace는 가산 각도 마진 $m_2$. ArcFace만이 **전 각도 구간에서 일정한 선형 마진**을 가지며, 이것이 측지 거리 해석의 근거이자 안정적 수렴의 이유다. 구현도 한 줄 수준으로 단순하고 계산 오버헤드가 무시할 만하다.

## 주요 결과

- MS1MV2(5.8M 장, 85k 인물) + ResNet100으로 LFW **99.83%**, YTF 98.02% — CosFace·SphereFace 대비 일관된 우위. MegaFace(백만 distractor), IJB-B/C 같은 대규모·저FAR 벤치마크에서 당시 SOTA를 석권했고, 특히 실무가 요구하는 낮은 FAR 영역(TAR@FAR=1e-4 이하)에서 격차가 크다.
- 학습된 임베딩의 각도 통계 분석으로 마진의 효과를 직접 확인 — softmax 대비 클래스 내 각도는 줄고 클래스 간 각도는 벌어진다.
- 확장판(TPAMI)의 **sub-center ArcFace**는 클래스당 중심을 $K=3$개 두어 노이즈 라벨을 자동 분리 — 웹 수집 데이터의 라벨 노이즈 대응까지 커버한다.

## 계보에서의 위치

이 손실의 진짜 유산은 도메인 경계를 넘은 데 있다. 얼굴 인식과 화자 검증은 문제 구조가 동일하다 — 수만 클래스의 분류로 학습하고, 학습에 없던 개체 쌍의 open-set 검증에 쓴다. 그래서 화자 인식 커뮤니티가 ArcFace를 **AAM-softmax**라는 이름으로 그대로 이식했고, [ECAPA-TDNN](/papers/ecapa-tdnn/)을 비롯한 현대 화자 임베딩은 사실상 전부 이 손실로 학습된다([화자 인식 글](/insight/speaker-recognition/) 참고). 비전 안에서는 [ResNet](/papers/resnet/) 백본 위의 얼굴 인식 표준이 되었음은 물론, 이미지 검색·재식별 등 "임베딩 간 거리가 곧 판정"인 모든 태스크의 기본 손실 후보가 됐다. softmax 분류와 메트릭 러닝(triplet 계열)의 오랜 경쟁을 "분류 프레임 안에 마진을 넣는" 쪽으로 정리한 논문이기도 하다.
