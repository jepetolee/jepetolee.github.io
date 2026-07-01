---
title: "PPO: 단순함으로 안정적인 정책 최적화"
date: 2022-09-10
category: 강화학습
subcategory: Policy Optimization
tags: ["강화학습", "OpenAI", "PPO", "Policy Gradient"]
paper: "Proximal Policy Optimization Algorithms"
paperUrl: "https://arxiv.org/abs/1707.06347"
authors: "John Schulman et al."
venue: "arXiv"
year: 2017
references: []
description: TRPO의 신뢰 영역 아이디어를 클리핑된 목적 함수로 단순화해, 구현 난이도를 크게 낮추면서도 안정적인 정책 학습을 달성한 알고리즘.
---

## 한 줄 요약

TRPO의 복잡한 2차 제약을 **클리핑된 surrogate 목적**으로 대체해, 1차 최적화만으로 안정적인 정책 업데이트를 얻는다. 현재까지 가장 널리 쓰이는 기본기다.

## 클리핑 목적 함수

확률비 $r_t(\theta) = \dfrac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}$ 에 대해

$$
L^{\text{CLIP}}(\theta) = \mathbb{E}_t\big[\min(r_t A_t,\ \text{clip}(r_t, 1-\epsilon, 1+\epsilon) A_t)\big]
$$

업데이트가 이전 정책에서 너무 멀어지지 않도록 비를 잘라낸다.

## 왜 기본기인가

- 구현이 간단하고 하이퍼파라미터에 비교적 둔감하다.
- on-policy이지만 미니배치 다중 epoch 업데이트로 표본을 재활용한다.
- World Models 계열의 모델 기반 접근과 대비되는 **모델 프리** 정책 최적화의 대표 주자다.
