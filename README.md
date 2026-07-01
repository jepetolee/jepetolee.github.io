# jepetolee's Insight

인공지능, 강화학습, 데이터 사이언스를 다루는 기술 블로그. [Astro](https://astro.build)로 구축되었습니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # Astro 빌드 + Pagefind 검색 인덱싱 (dist/)
npm run preview  # 빌드 결과 미리보기
```

## 구조

- `src/content/posts/<locale>/` — 블로그 글 (Markdown/MDX), 언어별 폴더
- `src/content/papers/<locale>/` — 논문 리뷰, 언어별 폴더
- `src/pages/[locale]/` — 언어 접두어(`/ko`, `/en`, …)가 붙는 모든 라우트
- `src/pages/index.astro` — 루트 언어 선택/자동 리다이렉트 페이지
- `src/i18n/` — 로케일 설정(`config.ts`), UI 사전(`ui.ts`), 경로 헬퍼(`utils.ts`)
- `src/components/`, `src/layouts/` — UI 컴포넌트와 레이아웃
- `src/styles/tokens.css` — 디자인 토큰 (라이트/다크)
- `src/config.ts` — 사이트 메타, 내비게이션, 소셜, Giscus/GA 설정

## 다국어 (i18n)

지원 언어: `ko`(기본/폴백), `en`, `es`, `ja`, `zh`, `ru`, `fr`, `de`. 모든 페이지는 언어 접두어(`/{locale}/...`)로 생성되며, 루트 `/`는 `navigator.language` 기반으로 자동 리다이렉트하고 수동 언어 선택 링크도 제공합니다.

- **UI 문자열**: `src/i18n/ui.ts`의 사전으로 7개 언어를 모두 번역합니다. 새 문자열은 `ui.ko`에 키를 추가하고 나머지 언어에도 채워 넣으세요. 누락된 키는 자동으로 `ko`로 폴백됩니다. 컴포넌트/페이지에서는 `useTranslations(locale)`로 얻은 `t('key', { param })`를 사용합니다.
- **글 콘텐츠**: 언어별 번역본은 같은 파일명(slug)으로 해당 언어 폴더에 추가합니다. 예: 한국어 원문 `src/content/posts/ko/my-post.md`의 영어 번역은 `src/content/posts/en/my-post.md`. 번역본이 없는 언어에서는 자동으로 `ko` 원문으로 폴백해 노출됩니다.
- **참조(reference)**: 논문 `references`에는 언어 접두어 없이 slug만 적습니다(예: `["planet", "world-models"]`). 렌더링 시 현재 언어에 맞춰 해석됩니다.
- **언어 추가**: `src/i18n/config.ts`의 `LOCALES`와 `LOCALE_META`, `astro.config.mjs`의 `i18n.locales` / `sitemap` 매핑, 그리고 `src/i18n/ui.ts` 사전에 항목을 추가합니다.

## 글 작성

`src/content/posts/ko/`에 `.md` 또는 `.mdx` 파일을 추가합니다(기본 언어). 다른 언어 번역본은 같은 파일명으로 `src/content/posts/<locale>/`에 추가하면 됩니다.

```yaml
---
title: 글 제목
date: 2026-01-01
category: 카테고리
tags: ["태그1", "태그2"]
series: 시리즈명        # 선택
featured: true          # 홈 추천 영역 노출 (선택)
description: 요약 설명
tldr:                   # 선택: TL;DR 박스
  - 핵심 요약 1
prerequisites:          # 선택: 사전 지식 박스
  - 필요한 배경 지식
---
```

### 분류 태그

`tags`에는 아래 핵심 분류 태그를 먼저 붙이고, 그 뒤에 학회명·회사명·모델명·프로젝트명·라이브러리명 같은 세부 태그를 추가합니다.

- 자연어 처리
- 컴퓨터 비전
- ASR
- 강화학습
- 추론 모델
- 인공신경망
- SNN
- 정보이론
- 머신 러닝
- 데이터셋
- 에이전트 AI
- 월드 모델
- 라이브러리

표준 세부 태그:

- 탑티어 학회: NeurIPS, ICML, ICLR, CVPR, ICCV, ECCV, ACL, EMNLP, NAACL, KDD, SIGGRAPH, CHI, WWW, SIGMOD, VLDB, SOSP, OSDI, NSDI, SIGCOMM, PLDI, POPL, FOCS, STOC, CCS, USENIX Security, IEEE S&P
- 회사/연구소: OpenAI, Google DeepMind, Google Research, Anthropic, Meta AI, Microsoft Research, NVIDIA, Apple, Amazon, Hugging Face, Mistral AI, xAI, Tesla, IBM Research

학회/회사 태그 페이지는 해당 태그가 붙은 글을 연도별로 묶고, `src/taxonomy.ts`에 정의된 대표 연구자 목록을 함께 보여줍니다. 논문 리뷰는 가능하면 `year`, `venue`, `authors`도 채워 둡니다.

예시:

```yaml
tags: ["강화학습", "월드 모델", "ICLR", "Google DeepMind", "Dreamer", "RSSM"]
```

수식은 `$...$`(인라인), `$$...$$`(블록)으로 작성하면 KaTeX로 렌더링됩니다.

## 댓글 (Giscus) 활성화

1. GitHub 저장소에서 **Discussions** 기능을 켭니다.
2. [giscus.app](https://giscus.app)에서 저장소를 연결해 `repoId`, `categoryId`를 발급받습니다.
3. `src/config.ts`의 `giscus` 항목에 값을 채웁니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드 후 GitHub Pages에 자동 배포합니다. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정하세요.

## 레거시

기존 Jekyll 소스는 `legacy/` 디렉터리에 보존되어 있습니다.
