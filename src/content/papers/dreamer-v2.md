---
title: "DreamerV2: 이산 잠재로 Atari를 정복하다"
date: 2022-10-25
category: 강화학습
subcategory: World Models
tags: ["강화학습", "Dreamer", "World Model", "Atari"]
paper: "Mastering Atari with Discrete World Models"
paperUrl: "https://arxiv.org/abs/2010.02193"
authors: "Danijar Hafner et al."
venue: "ICLR"
year: 2021
references: ["dreamer"]
description: Dreamer의 연속 잠재를 범주형(categorical) 잠재로 바꾸고 KL 밸런싱을 도입해, 단일 월드 모델로 인간 수준 Atari 성능을 달성한 모델.
---

## 한 줄 요약

[Dreamer](/papers/dreamer/)의 골격을 유지하면서 잠재 표현을 **범주형(categorical)** 으로 바꾼 것이 핵심이다. 이 작은 변화가 Atari에서 큰 성능 향상을 만든다.

## 핵심 변경점

- **이산 잠재(categorical latents)**: 가우시안 대신 범주형 분포를 straight-through 그래디언트로 학습한다. 멀티모달한 미래를 더 잘 표현한다.
- **KL 밸런싱**: prior와 posterior의 KL을 비대칭 가중치로 조절해, 표현 붕괴를 막고 동역학 학습을 안정화한다.

## 계보에서의 위치

World Models → PlaNet → Dreamer로 이어진 잠재 동역학 계열에서, DreamerV2는 **표현(잠재 분포)** 설계가 성능을 좌우함을 보였다. 이후 DreamerV3가 다양한 도메인을 단일 하이퍼파라미터로 다루는 방향으로 발전한다.
