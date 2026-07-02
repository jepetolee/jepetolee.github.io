---
title: "Flow Matching: 시뮬레이션 없이 배우는 결정론적 생성 경로"
date: 2026-07-01
draft: false
category: 컴퓨터 비전
subcategory: 생성 모델
tags: ["컴퓨터 비전", "디퓨전", "이미지 생성", "ICLR", "Flow Matching", "Continuous Normalizing Flow"]
paper: "Flow Matching for Generative Modeling"
paperUrl: "https://arxiv.org/abs/2210.02747"
authors: "Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, Matt Le"
venue: "ICLR"
year: 2023
references: ["ddpm"]
description: Continuous Normalizing Flow를 시뮬레이션(ODE 적분) 없이 회귀만으로 학습하는 Flow Matching을 제안한다. 고정된 조건부 확률 경로의 벡터장을 직접 회귀하는 것만으로 확산 모델과 동등하거나 더 나은 성능을, 훨씬 적은 샘플링 스텝으로 달성한다.
---

## 한 줄 요약

노이즈 분포에서 데이터 분포로 가는 확률 경로 $p_t$를 미리 고정해두고, 그 경로를 따라 흐르는 벡터장 $u_t$를 신경망 $v_t(x;\theta)$로 **직접 회귀(regression)**하는 것만으로 Continuous Normalizing Flow(CNF)를 학습할 수 있다. 이 목표(Conditional Flow Matching)는 다루기 힘든 주변(marginal) 벡터장 대신 다루기 쉬운 조건부(conditional) 벡터장으로 치환해도 그래디언트가 동일하다는 것이 핵심이며, 확산 모델의 forward/reverse process를 포함해 훨씬 넓은 확률 경로 계열을 하나의 프레임워크로 학습할 수 있게 한다.

## 핵심 기여

- **Flow Matching (FM) 목적함수**: 시간 $t \sim U[0,1]$과 목표 확률 경로 $p_t(x)$(노이즈 $p_0$에서 데이터 $p_1$로 가는 밀도 경로) 위의 $x \sim p_t(x)$에 대해, 신경망 벡터장 $v_t(x;\theta)$이 그 경로를 생성하는 실제 벡터장 $u_t(x)$를 회귀하도록 한다.

$$\mathcal{L}_\text{FM}(\theta) = \mathbb{E}_{t,\, p_t(x)} \left\lVert v_t(x) - u_t(x) \right\rVert^2$$

  문제는 $u_t(x)$와 $p_t(x)$ 모두 개별 데이터 포인트 $x_1$들에 대한 적분을 포함하는 다루기 힘든(intractable) 양이라는 점이다.

- **Conditional Flow Matching (CFM)**: 각 데이터 샘플 $x_1 \sim q(x_1)$마다 조건부 확률 경로 $p_t(x \mid x_1)$과 그 경로를 생성하는 조건부 벡터장 $u_t(x \mid x_1)$을 설계하면, 다음 목적함수로 치환할 수 있다.

$$\mathcal{L}_\text{CFM}(\theta) = \mathbb{E}_{t,\, q(x_1),\, p_t(x \mid x_1)} \left\lVert v_t(x) - u_t(x \mid x_1) \right\rVert^2$$

  이 조건부 목적함수는 개별 $x_1$에 대해 닫힌 형태로 샘플링·계산이 가능하다. 논문의 핵심 정리(Theorem 2)는 $\nabla_\theta \mathcal{L}_\text{FM}(\theta) = \nabla_\theta \mathcal{L}_\text{CFM}(\theta)$임을 보이는 것으로, 다루기 힘든 FM 대신 다루기 쉬운 CFM을 최적화해도 동일한 벡터장으로 수렴함을 보장한다.

- **가우시안 조건부 경로**: $p_t(x \mid x_1) = \mathcal{N}(x \mid \mu_t(x_1), \sigma_t(x_1)^2 I)$ 형태의 경로를 쓰면, 경계 조건 $\mu_0(x_1)=0,\ \sigma_0(x_1)=1,\ \mu_1(x_1)=x_1,\ \sigma_1(x_1)=\sigma_\text{min}$ 아래 흐름 $\psi_t(x) = \sigma_t(x_1)x + \mu_t(x_1)$이 그 경로를 생성하는 조건부 벡터장은 닫힌 형태로 유도된다(Theorem 3).

$$u_t(x \mid x_1) = \frac{\sigma_t'(x_1)}{\sigma_t(x_1)}\left(x - \mu_t(x_1)\right) + \mu_t'(x_1)$$

  이 정식화는 diffusion process가 유도하는 경로(분산 보존형 등)도 특수 사례로 포함하므로, DDPM 스타일 경로를 시뮬레이션 없이 회귀만으로 재현할 수 있다.

- **Optimal Transport(OT) 조건부 경로**: 저자들은 굳이 확산 과정을 흉내낼 필요 없이, 노이즈와 데이터 사이를 **직선으로 보간**하는 더 단순한 경로를 제안한다.

$$\mu_t(x_1) = t\, x_1, \qquad \sigma_t(x_1) = 1-(1-\sigma_\text{min})t$$

  이에 대응하는 조건부 벡터장은

$$u_t(x \mid x_1) = \frac{x_1 - (1-\sigma_\text{min})x}{1-(1-\sigma_\text{min})t}$$

  로, 각 조건부 경로가 시간에 대해 **일정한 방향과 속도**를 갖는 직선 궤적을 이룬다. 확산 경로가 곡선을 그리며 종종 목표를 지나쳤다가 되돌아오는(overshoot) 궤적을 만드는 것과 대비된다.

## 기존 DDPM의 확률적 디노이징 과정과 무엇이 달라졌는가

[DDPM](/papers/ddpm/)은 고정된 마르코프 체인으로 정의된다. Forward process $q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t}\,x_{t-1}, \beta_t I)$가 매 스텝마다 새 가우시안 노이즈를 주입하고, 학습된 reverse process $p_\theta(x_{t-1}\mid x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t,t), \Sigma_\theta(x_t,t))$ 역시 매 스텝 샘플링 시 확률적 노이즈를 다시 섞어 넣는다. 즉 학습(ELBO 전개)과 샘플링(ancestral sampling) 모두 이산화된 확률적(stochastic) 과정이며, 벡터장이 아니라 이산 시간 스텝별 전이 분포의 평균/분산을 직접 다룬다.

Flow Matching은 이 구조를 근본적으로 바꾼다.

- **확률적 SDE/마르코프 체인 → 결정론적 ODE**: FM은 애초에 diffusion process를 정의하지 않는다. 노이즈 분포에서 데이터 분포로 가는 확률 경로 $p_t$와 그 경로를 생성하는 벡터장 $u_t$만 지정하면 되고, 샘플링은 $d\phi_t(x)/dt = v_t(\phi_t(x))$라는 **결정론적 ODE**를 적분하는 것이다. DDPM의 reverse process가 매 스텝 $\Sigma_\theta$ 만큼의 노이즈를 재주입하는 확산 SDE인 반면, FM의 흐름 $\phi_t$는 given $x_0$에 대해 유일하게 정해지는 경로를 따른다. (DDPM도 probability flow ODE로 재해석하면 결정론적 형태를 가지지만, DDPM 자체의 학습·샘플링 정의는 확률적 마르코프 체인이다.)
- **디퓨전 과정을 유도할 필요가 없음**: DDPM은 $\beta_t$ 스케줄로 forward diffusion을 먼저 정의하고, 그로부터 reverse process의 사후분포 $q(x_{t-1}\mid x_t,x_0)$를 닫힌 형태로 유도한 뒤 그 평균을 $\epsilon$-예측으로 재매개변수화하는 우회적인 경로를 거친다. FM은 반대로 확률 경로 $p_t(x\mid x_1)$과 그 경로를 만드는 벡터장 $u_t(x\mid x_1)$을 원하는 형태로 **직접 설계**하고 곧바로 회귀한다. 확산 스타일 경로는 이 설계 공간 중 하나의 특수 사례일 뿐이다.
- **곡선 궤적 → 직선 궤적(OT 경로)**: DDPM류 확산 경로는 노이즈를 점진적으로 걷어내는 과정에서 궤적이 휘어지고 종종 overshoot한다. OT 조건부 경로를 쓰면 각 샘플의 궤적이 노이즈에서 데이터까지 **등속 직선**이 되어, ODE 솔버가 훨씬 적은 함수 평가(NFE) 수로도 정확한 적분에 도달한다.
- **시뮬레이션-프리 학습**: DDPM의 $L_\text{simple}$ 학습도 이미 시뮬레이션이 필요 없지만, 이는 ELBO 전개가 정확히 가우시안 확산에 대해서만 닫힌 형태를 주기 때문이다. FM/CFM은 이 유도 없이도 임의의 조건부 확률 경로에 대해 일반적으로 시뮬레이션-프리 회귀 손실을 구성하는 방법을 제시한다.

## 실험 결과

- CIFAR-10, ImageNet 32×32/64×64/128×128 등에서 FM(특히 OT 경로)은 NLL(bits/dim)과 FID 양쪽에서 DDPM 및 score matching 기반 확산 모델 대비 일관되게 더 낫거나 대등한 결과를 보였다.
- **샘플링 효율**: 동일한 오차 수준에 도달하는 데 필요한 NFE가 DDPM보다 뚜렷하게 적었다(OT 경로가 가장 적음). 이는 OT 경로의 직선 궤적이 낮은 차수의 ODE 솔버로도 잘 적분되기 때문이다.
- **학습 효율**: ImageNet-128 실험에서 FM은 더 적은 이미지 처리량으로도 비교 대상 확산 모델보다 우수한 결과에 도달했다고 보고한다.

## 인사이트

DDPM이 "노이즈를 씌우는 마르코프 체인을 정의하고 그 역과정을 유도"하는 방식으로 확산 모델을 정당화했다면, Flow Matching은 그 순서를 뒤집어 "원하는 확률 경로와 벡터장을 먼저 설계하고 회귀로 배운다"는 훨씬 일반적인 관점을 제시한다. 확산 경로는 이 틀에서 여러 선택지 중 하나로 재해석되며, 굳이 확산 과정에 얽매이지 않아도 되므로 OT 경로처럼 더 단순하고 빠른 대안을 자유롭게 설계할 수 있게 됐다.

이 논문은 [DDPM](/papers/ddpm/)이 정립한 노이즈-디노이징 생성 패러다임을 유지하면서도, 학습을 "느린 확률적 마르코프 체인의 근사"에서 "고정 경로에 대한 지도학습적 벡터장 회귀"로 단순화했다는 점에서 이후 rectified flow, stochastic interpolants 등 직선/최적수송 기반 생성 모델 계열, 그리고 실제 이미지·영상·음성 생성 서비스에서 널리 쓰이는 빠른 ODE 기반 샘플러들의 이론적 토대가 되었다.
