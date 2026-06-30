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

- `src/content/posts/` — 블로그 글 (Markdown/MDX)
- `src/content/notes/` — 논문·모델 짧은 노트
- `src/pages/` — 라우트 (Home, Insight, Best, Notes, Tags, Series, About, Search)
- `src/components/`, `src/layouts/` — UI 컴포넌트와 레이아웃
- `src/styles/tokens.css` — 디자인 토큰 (라이트/다크)
- `src/config.ts` — 사이트 메타, 내비게이션, 소셜, Giscus/GA 설정

## 글 작성

`src/content/posts/`에 `.md` 또는 `.mdx` 파일을 추가합니다.

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

수식은 `$...$`(인라인), `$$...$$`(블록)으로 작성하면 KaTeX로 렌더링됩니다.

## 댓글 (Giscus) 활성화

1. GitHub 저장소에서 **Discussions** 기능을 켭니다.
2. [giscus.app](https://giscus.app)에서 저장소를 연결해 `repoId`, `categoryId`를 발급받습니다.
3. `src/config.ts`의 `giscus` 항목에 값을 채웁니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드 후 GitHub Pages에 자동 배포합니다. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정하세요.

## 레거시

기존 Jekyll 소스는 `legacy/` 디렉터리에 보존되어 있습니다.
