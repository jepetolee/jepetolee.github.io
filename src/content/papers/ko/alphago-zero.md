---
title: "AlphaGo Zero: 탐색이 곧 정책 개선 연산자 — 백지에서의 GPI"
date: 2026-07-03
draft: false
category: 강화학습
subcategory: Planning & Search
tags: ["강화학습", "Google DeepMind", "AlphaGo Zero", "MCTS", "Self-play", "바둑"]
paper: "Mastering the game of Go without human knowledge"
paperUrl: "https://doi.org/10.1038/nature24270"
authors: "David Silver, Julian Schrittwieser, Karen Simonyan, et al."
venue: "Nature"
year: 2017
references: ["alphago", "resnet"]
description: 인간 기보·롤아웃·수작업 특징을 전부 제거하고, 정책과 가치를 겸하는 ResNet 하나와 MCTS만 남긴다. 현재 네트워크로 돌린 MCTS의 착수 분포가 네트워크 자신의 정책보다 항상 강하다는 점을 이용해 "탐색 결과를 지도 신호로 네트워크를 학습 → 강해진 네트워크로 더 강한 탐색"의 self-play 루프를 닫았고, 백지에서 72시간 만에 이세돌을 이긴 버전을 100-0으로 넘어섰다.
---

## 한 줄 요약

[AlphaGo](/papers/alphago/)는 인간 기보 지도학습에서 출발하는 파이프라인이었다. 이 논문의 질문은 급진적이다 — **인간 지식 없이, 규칙만 주고, 백지(tabula rasa)에서 같은 곳에 도달할 수 있는가?** 답의 핵심은 MCTS의 재해석이다: 현재 네트워크가 안내한 탐색이 내놓는 착수 분포는 네트워크의 원래 정책보다 **항상 강하다** — 즉 **MCTS는 강력한 정책 개선 연산자**다. 그렇다면 탐색의 출력을 지도 신호로 네트워크를 개선하고, 개선된 네트워크로 더 강한 탐색을 만드는 루프가 자기완결적으로 닫힌다. [동적 계획법의 GPI](/insight/rl-dynamic-programming/)가 사상 최대 규모로 구현된 것이다.

## 핵심 기여

- **하나의 네트워크로 통합**: [AlphaGo](/papers/alphago/)의 네트워크 4개(SL/RL 정책망, 가치망, 롤아웃)를 **정책과 가치를 두 헤드로 내는 [ResNet](/papers/resnet/) 하나** $(\boldsymbol{p}, v) = f_\theta(s)$로 대체한다. 입력도 수작업 특징 없이 돌의 배치 히스토리만. 아키텍처 ablation이 명확하다 — conv → residual 전환과 정책·가치의 몸통 공유가 각각 큰 폭의 기력 향상을 준다(공유는 정규화로 작용한다).

- **Self-play 학습 루프**: 매 수마다 현재 네트워크로 MCTS(1,600 시뮬레이션)를 돌리고, 방문 횟수에서 유도한 탐색 정책 $\pi_a \propto N(s, a)^{1/\tau}$로 착수한다. 판이 끝나 승패 $z$가 정해지면, 그 판의 각 국면에 대해

$$\mathcal{L} = (z - v)^2 - \boldsymbol{\pi}^\top \log \boldsymbol{p} + c \lVert \theta \rVert^2$$

  — **정책 헤드는 탐색의 착수 분포 $\boldsymbol{\pi}$를, 가치 헤드는 실제 승패 $z$를 맞추도록** 회귀한다. 평가(가치 헤드 ← self-play 결과)와 개선(정책 헤드 ← 탐색 분포)이 한 손실에 들어 있는, 문자 그대로의 GPI다.

- **롤아웃의 완전 제거**: 잎 평가는 가치 헤드 $v$ 단독 — [AlphaGo](/papers/alphago/)에서 절반을 담당하던 몬테카를로 롤아웃이 사라졌다. [UCT](/papers/uct/) 이후 10년간 MCTS의 정의처럼 여겨졌던 "시뮬레이션" 단계가, 충분히 좋은 학습된 평가 함수 앞에서는 불필요하다는 선언이다.

- **결과와 학습 곡선**: 학습 시작 후 36시간에 이세돌을 이긴 AlphaGo Lee 수준을 넘고, **72시간 시점의 대결에서 100-0**(단일 머신 4 TPU vs 분산 시스템이었던 Lee 버전). 40일 학습한 대형 버전은 당시 최강이던 AlphaGo Master도 넘어선다(Elo ~5,185). 정성적 관찰도 흥미롭다 — 인간의 정석들을 스스로 재발견했다가 일부는 더 나은 자기만의 변형으로 **폐기**하는 과정이 학습 곡선에 나타난다. 인간 기보로 초기화한 대조군이 초기엔 앞서다 결국 뒤처지는 것까지 — 인간 사전 지식이 자산이 아니라 천장이 될 수 있다는 증거다.

## 계보에서의 위치

[계획과 탐색 글](/insight/rl-planning-mcts/)에서 시리즈 전체의 종착점으로 삼은 논문이다. 개념적 기여는 바둑을 넘어선다 — "탐색(느리고 강한 사고)의 출력을 지도 신호로 신경망(빠르고 약한 직관)을 증류하고, 강해진 직관으로 더 강한 탐색을 만든다"는 루프는, 정책 개선 연산자 자리에 무엇이 오든(탐색, 검증기, 더 긴 추론) 성립하는 일반 원리다. 직계 후속으로 같은 알고리즘을 체스·쇼기로 일반화한 AlphaZero(2017), 환경 모델까지 잠재 공간에서 학습해 규칙 지식마저 제거한 MuZero(2020)가 있고 — 후자에서 이 노선은 [World Models 계열](/papers/world-models/)과 합류한다. LLM 시대에 "추론 시간 탐색으로 만든 데이터로 모델을 개선한다"는 self-improvement 레시피가 부활할 때마다 원형으로 재소환되는 것도 이 논문이다.
