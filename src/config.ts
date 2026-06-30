export const SITE = {
  title: "jepetolee's Insight",
  tagline: 'for Study & Insight',
  description: '인공지능, 강화학습, 데이터 사이언스를 깊이 있게 다루는 기술 블로그',
  url: 'https://jepetolee.github.io',
  lang: 'ko',
  author: {
    name: 'jepetolee',
    bio: "I'll prove myself. 천번의 연습을 단(鍛), 만번의 연습을 련(練)이라고 한다.",
    intro: '인공지능, 강화학습, 데이터 사이언스를 공부하고 기록합니다.',
  },
  postsPerPage: 5,
  // Google Analytics 4
  googleAnalyticsId: 'G-9F6FRCP1DK',
  // Giscus (GitHub Discussions comments). Fill in after enabling Discussions + giscus app.
  giscus: {
    repo: 'jepetolee/jepetolee.github.io',
    repoId: '',
    category: 'Comments',
    categoryId: '',
  },
} as const;

export const NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Insight', href: '/insight/' },
  { label: 'Best', href: '/best/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'About', href: '/about/' },
];

export const SOCIAL = {
  github: 'https://github.com/jepetolee',
  linkedin: 'https://www.linkedin.com/in/lee-jepeto-7b27781b3/',
  email: 'mailto:jepetolee@gmail.com',
};
