---
scope: Flow Matching의 ODE 기반 생성 과정과 (Conditional) Flow Matching 목적함수를 정리한 한국어 해설
origin: user
sources:
  - https://arxiv.org/abs/2210.02747
status: pending
---

## Flow Matching의 결정론적 과정

Flow Matching(FM, Lipman et al. 2022/2023)은 Continuous Normalizing Flow(CNF)를 시뮬레이션
없이 학습하는 방법이다. DDPM처럼 노이즈 주입 마르코프 체인을 먼저 정의하고 그 역과정을 유도하는
대신, 노이즈 분포 $p_0$에서 데이터 분포 $p_1$로 가는 **확률 경로 $p_t$**와 그 경로를 만드는
**벡터장 $u_t$**를 직접 설계한 뒤, 신경망이 그 벡터장을 회귀하도록 학습한다.

### ODE로 정의되는 생성 과정

샘플링은 다음 상미분방정식(ODE)을 적분하는 것으로 정의된다.

$$\frac{d\phi_t(x)}{dt} = v_t(\phi_t(x))$$

여기서 $v_t(\cdot;\theta)$는 학습된 신경망 벡터장이다. $t=0$에서 노이즈 $x_0 \sim p_0$로 시작해
이 ODE를 $t=1$까지 적분하면 데이터 샘플 $\phi_1(x_0)$을 얻는다. 이 과정에는 확률적 노이즈
재주입이 전혀 없다 — 초기값 $x_0$가 정해지면 궤적 전체가 결정론적으로 정해진다.

### Flow Matching / Conditional Flow Matching 목적함수

이상적인 FM 목적함수는 신경망 벡터장이 목표 벡터장 $u_t(x)$를 회귀하도록 하는 것이다.

$$\mathcal{L}_\text{FM}(\theta) = \mathbb{E}_{t,\, p_t(x)} \left\lVert v_t(x) - u_t(x) \right\rVert^2$$

문제는 $u_t(x)$와 $p_t(x)$가 모든 데이터 포인트에 대한 적분을 포함해 다루기 힘들다는 것이다.
저자들은 개별 데이터 $x_1 \sim q(x_1)$마다 조건부 확률 경로 $p_t(x\mid x_1)$과 그에 대응하는
조건부 벡터장 $u_t(x\mid x_1)$을 설계해 다음과 같은 Conditional Flow Matching(CFM) 목적함수로
치환한다.

$$\mathcal{L}_\text{CFM}(\theta) = \mathbb{E}_{t,\, q(x_1),\, p_t(x \mid x_1)} \left\lVert v_t(x) - u_t(x \mid x_1) \right\rVert^2$$

핵심 정리는 $\nabla_\theta \mathcal{L}_\text{FM}(\theta) = \nabla_\theta \mathcal{L}_\text{CFM}(\theta)$,
즉 다루기 쉬운 CFM을 최적화해도 원래의 FM과 동일한 그래디언트로 수렴한다는 것이다.

### Optimal Transport(OT) 조건부 경로 — 직선 궤적

가우시안 조건부 경로 $p_t(x\mid x_1) = \mathcal{N}(x\mid \mu_t(x_1), \sigma_t(x_1)^2 I)$ 중에서도,
저자들은 노이즈와 데이터 사이를 단순히 직선으로 잇는 OT 경로를 제안한다.

$$\mu_t(x_1) = t\, x_1, \qquad \sigma_t(x_1) = 1-(1-\sigma_\text{min})t$$

$$u_t(x \mid x_1) = \frac{x_1 - (1-\sigma_\text{min})x}{1-(1-\sigma_\text{min})t}$$

각 조건부 경로가 시간에 대해 일정한 방향/속도를 갖는 직선이 되어, 확산 경로처럼 궤적이 휘거나
목표를 지나쳤다 되돌아오는(overshoot) 현상이 없다. 그 결과 ODE 솔버가 더 적은 함수 평가(NFE)
만으로도 정확하게 적분할 수 있어 샘플링이 훨씬 빠르다.

## DDPM과의 핵심 차이 (요약)

| | DDPM | Flow Matching |
|---|---|---|
| 생성 과정 | 확률적 SDE / 이산 마르코프 체인 (매 스텝 노이즈 재주입) | 결정론적 ODE (초기값에 궤적이 유일하게 정해짐) |
| 경로 설계 | forward diffusion을 먼저 정의 → reverse process를 유도 | 확률 경로 $p_t$·벡터장 $u_t$를 원하는 형태로 직접 설계 |
| 궤적 형태 | 곡선, overshoot 가능 | (OT 경로 사용 시) 직선, 등속 |
| 학습 목표 | 노이즈 $\epsilon$ 예측 (ELBO 단순화) | 벡터장 $v_t$ 회귀 (CFM) |

자세한 DDPM 쪽 수식은 `ddpm-sde.md` 참고.
