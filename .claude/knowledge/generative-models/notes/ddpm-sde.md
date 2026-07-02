---
scope: DDPM의 forward/reverse 과정을 SDE(확률미분방정식)/마르코프 체인 관점에서 정리한 한국어 해설
origin: user
sources:
  - https://arxiv.org/abs/2006.11239
status: pending
---

## DDPM의 확률적 과정

DDPM(Denoising Diffusion Probabilistic Models, Ho et al. 2020)은 데이터를 노이즈로 바꾸는 고정된
**forward process**와, 노이즈를 다시 데이터로 되돌리는 학습된 **reverse process**를 이산 시간 스텝의
마르코프 체인으로 정의한다. 둘 다 매 스텝 새로운 확률적(stochastic) 노이즈를 주입/추정한다는 점에서
SDE(확률미분방정식)의 이산화 버전으로 볼 수 있다.

### Forward process (노이즈를 씌우는 과정)

고정된 분산 스케줄 $\beta_1, \dots, \beta_T$를 따라 매 스텝 가우시안 노이즈를 더한다.

$$q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{1-\beta_t}\, x_{t-1}, \beta_t I)$$

$\alpha_t := 1-\beta_t$, $\bar\alpha_t := \prod_{s=1}^t \alpha_s$로 두면, $t$ 단계까지 노이즈를 누적한
효과를 닫힌 형태로 한 번에 계산할 수 있다.

$$q(x_t \mid x_0) = \mathcal{N}(x_t; \sqrt{\bar\alpha_t}\, x_0, (1-\bar\alpha_t) I)$$

즉 forward process 자체는 학습 대상이 아니라 미리 정해진 확산 스케줄이며, $t \to T$로 갈수록
$x_t$는 순수한 가우시안 노이즈 $\mathcal{N}(0, I)$에 수렴하도록 설계된다.

### Reverse process (노이즈를 걷어내는 과정)

$p(x_T) = \mathcal{N}(0, I)$에서 출발해, 학습된 가우시안 전이로 한 스텝씩 노이즈를 제거하며
데이터를 복원한다.

$$p_\theta(x_{t-1} \mid x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t))$$

여기서 분산 $\Sigma_\theta$는 보통 학습하지 않고 $\sigma_t^2 I$로 고정한다(학습 가능하게 두면
오히려 불안정해짐). 평균 $\mu_\theta$는 변분 하한(ELBO)을 전개해 유도한 사후분포
$q(x_{t-1}\mid x_t, x_0)$의 평균과 맞추도록 학습되는데, 실제로는 평균을 직접 예측하는 대신
**더해진 노이즈 $\epsilon$을 예측**하도록 재매개변수화한다.

$$\mu_\theta(x_t, t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\, \epsilon_\theta(x_t, t)\right)$$

학습 손실은 이론적 ELBO 가중치를 제거한 단순화된 형태를 쓴다.

$$L_\text{simple}(\theta) = \mathbb{E}_{t, x_0, \epsilon}\left[\left\lVert \epsilon - \epsilon_\theta(\sqrt{\bar\alpha_t}\, x_0 + \sqrt{1-\bar\alpha_t}\, \epsilon,\ t) \right\rVert^2\right]$$

### 왜 "확률적(stochastic)" 과정인가

- Forward process는 매 스텝 독립적인 가우시안 노이즈를 실제로 **주입**한다 — 결정론적 함수가
  아니라 확률분포에서의 샘플링이다.
- Reverse process(ancestral sampling)도 마찬가지로 매 스텝 $\mathcal{N}(\mu_\theta, \Sigma_\theta)$에서
  다시 샘플링하며 노이즈를 재도입한다. 즉 같은 $x_T$에서 출발해도 매 샘플링 실행마다 다른 경로로
  다른 결과가 나올 수 있다.
- 전체 학습·샘플링 절차가 $T$개의 이산 시간 스텝을 갖는 마르코프 체인이며, 연속시간 극한을 취하면
  drift(평균 이동)와 diffusion(분산 확산) 항을 모두 가진 SDE로 일반화된다. 이 때문에 샘플링이
  본질적으로 여러 스텝(전형적으로 $T=1000$)의 순차적 확률 과정이라 느리다는 한계가 있다.

## 관련 노트

Flow Matching은 이 확률적 SDE/마르코프 체인 대신 결정론적 ODE로 생성 과정을 재정의한다 —
자세한 비교는 `flow-matching-ode.md` 참고.
