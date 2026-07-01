---
title: "DDPM: 노이즈 예측으로 여는 확산 생성 모델"
date: 2026-07-01
draft: true
category: 컴퓨터 비전
subcategory: 생성 모델
tags: ["컴퓨터 비전", "디퓨전", "이미지 생성", "NeurIPS", "DDPM", "U-Net"]
paper: "Denoising Diffusion Probabilistic Models"
paperUrl: "https://arxiv.org/abs/2006.11239"
authors: "Jonathan Ho, Ajay Jain, Pieter Abbeel"
venue: "NeurIPS"
year: 2020
references: []
description: 데이터에 가우시안 노이즈를 점진적으로 더하는 forward process를 거꾸로 되돌리는 reverse process를 신경망으로 학습해 이미지를 생성한다. 노이즈 자체를 예측하는 ε-parameterization과 단순화된 손실 L_simple로 확산 모델을 실용적인 생성 모델링 방법으로 끌어올렸다.
---

## 한 줄 요약

데이터를 순차적으로 가우시안 노이즈에 파묻는 고정된 forward diffusion process와, 이를 거꾸로 되돌리며 노이즈를 걷어내는 학습된 reverse process 한 쌍으로 이미지를 생성한다. 핵심은 reverse process의 평균을 직접 예측하는 대신 **더해진 노이즈 자체를 예측**하도록 재매개변수화(reparameterize)하고, 가중치를 없앤 단순화된 손실 $L_\text{simple}$로 학습한다는 점이다.

## 핵심 기여

- **Forward process**: 고정된 분산 스케줄 $\beta_1, \dots, \beta_T$를 따라 $x_0$에 가우시안 노이즈를 단계적으로 더하는 마르코프 체인이다.

$$q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t}\, x_{t-1}, \beta_t I)$$

  $\alpha_t := 1-\beta_t$, $\bar\alpha_t := \prod_{s=1}^t \alpha_s$로 두면 임의의 $t$에서 한 번에 노이즈를 씌운 샘플을 닫힌 형태로 얻을 수 있다.

$$q(x_t \mid x_0) = \mathcal{N}(x_t; \sqrt{\bar\alpha_t}\, x_0, (1-\bar\alpha_t) I)$$

- **Reverse process**: $p(x_T) = \mathcal{N}(0, I)$에서 시작해, 학습된 가우시안 전이로 노이즈를 걷어내며 데이터를 복원하는 마르코프 체인이다.

$$p_\theta(x_{t-1} \mid x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t))$$

  분산 $\Sigma_\theta$는 학습하지 않고 $\sigma_t^2 I$ ($\sigma_t^2 = \beta_t$ 또는 $\tilde\beta_t$)로 고정한다. 학습 가능하게 두면 오히려 학습이 불안정해진다는 것을 ablation에서 보였다.

- **ε-parameterization**: 변분 하한(ELBO)을 전개하면 각 시점 $t$의 손실 항이 $q(x_{t-1}\mid x_t, x_0)$의 사후 평균 $\tilde\mu_t$와 $\mu_\theta$ 사이의 차이로 귀결된다. 저자들은 $\mu_\theta$를 직접 예측하는 대신, 노이즈를 예측하는 네트워크 $\epsilon_\theta$로 재매개변수화한다.

$$\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\, \epsilon_\theta(x_t, t)\right)$$

  이 형태는 Langevin dynamics의 스코어 기반 업데이트 식과 닮아 있고, denoising score matching과의 연결점을 드러낸다.

- **단순화된 손실**: 이론적으로 정당화된 시점별 가중 변분 하한 대신, 가중치를 제거한 MSE 손실만으로 학습해도(오히려 더 잘) 샘플 품질이 좋아진다.

$$L_\text{simple}(\theta) = \mathbb{E}_{t, x_0, \epsilon}\left[\left\lVert \epsilon - \epsilon_\theta(\sqrt{\bar\alpha_t}\, x_0 + \sqrt{1-\bar\alpha_t}\, \epsilon,\ t) \right\rVert^2\right]$$

  이 목적함수는 원래 변분 하한 대비 작은 $t$(쉬운 디노이징) 항의 가중치를 낮춰, 어려운 큰 $t$ 구간의 디노이징 학습에 상대적으로 더 집중하게 만드는 효과를 낸다.

- **아키텍처**: group normalization을 쓴 U-Net을 백본으로 사용하고, 시점 $t$는 Transformer의 사인/코사인 위치 임베딩과 같은 방식으로 네트워크에 주입한다. $16\times16$ 해상도의 feature map에는 self-attention을 둔다. $T=1000$, $\beta_t$는 $10^{-4}$에서 $0.02$까지 선형 스케줄을 사용했다.

## 실험 결과

- **CIFAR-10 (unconditional)**: Inception Score 9.46±0.11, FID 3.17로 당시 대부분의 선행 연구를 능가했다. NLL은 3.75 bits/dim 이하.
- **LSUN 256×256**: Church FID 7.89, Bedroom FID 4.90.
- **CelebA-HQ 256×256**: ProgressiveGAN에 필적하는 샘플 품질을 보였다.
- **Ablation**: $\epsilon$-예측 + $L_\text{simple}$ 조합이 $\tilde\mu$를 직접 예측하는 방식보다 훨씬 우수했다. 반면 우도(NLL) 관점에서는 다른 우도 기반 생성모델보다 다소 뒤처지는데, 이는 확산 모델이 손실 압축(lossy compression)에는 강한 귀납 편향을 갖지만 무손실 압축에는 그렇지 않음을 시사한다.

논문은 reverse process를 progressive decoding으로 해석해 rate-distortion을 분석한다. CIFAR-10에서 Rate 1.78 bits/dim, Distortion 1.97 bits/dim을 얻었고, 전체 무손실 코드 길이의 절반 이상이 사람 눈에 거의 보이지 않는 디테일을 인코딩하는 데 쓰인다는 것을 보였다. 이는 autoregressive decoding을 임의의 비트 순서로 일반화한 것으로 볼 수 있다.

## 인사이트

이 논문은 diffusion probabilistic model(Sohl-Dickstein et al., 2015)이라는 비교적 덜 알려진 프레임워크를, **노이즈를 직접 예측하는 단순한 재매개변수화 하나**로 실제로 GAN과 경쟁 가능한 이미지 생성 품질을 내는 방법으로 바꿔놓았다. $\epsilon$-prediction과 denoising score matching의 연결고리를 명시적으로 드러낸 것도 이후 score-based generative model 계열과 확산 모델 계열이 하나의 이론적 틀로 수렴하는 계기가 됐다.

다만 reverse process가 $T=1000$ 스텝의 순차적 마르코프 체인이라 샘플링이 GAN 대비 극도로 느리다는 한계가 뚜렷하다. 이 문제는 이후 DDIM의 비마르코프적 결정론적 샘플링, classifier guidance/classifier-free guidance를 통한 조건부 생성, 그리고 Latent Diffusion(Stable Diffusion)의 압축된 잠재 공간에서의 확산으로 이어지며 이 블로그에서 앞으로 다룰 확산 모델 계보의 출발점이 된다.
