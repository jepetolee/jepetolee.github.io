import { DEFAULT_LOCALE, type Locale } from './config';

/**
 * UI string dictionary. Keys are shared across all locales.
 * Missing keys in a locale fall back to the default locale (ko).
 * Placeholders use the `{name}` syntax and are filled by `t(key, params)`.
 */
export const ui = {
  ko: {
    'nav.home': '홈',
    'nav.blog': '블로그',
    'nav.papers': '논문 리뷰',
    'nav.tags': '태그',
    'nav.about': '소개',

    'site.tagline': 'for Study & Insight',
    'site.description': '인공지능, 강화학습, 데이터 사이언스를 깊이 있게 다루는 기술 블로그',
    'site.intro': '인공지능, 강화학습, 데이터 사이언스를 공부하고 기록합니다.',

    'langSwitcher.label': '언어',

    'home.ctaBlog': '블로그 글',
    'home.ctaPapers': '논문 리뷰',
    'home.featured': '추천 글',
    'home.recentPosts': '최근 블로그 글',
    'home.allPosts': '모든 글 보기',
    'home.paperReviews': '논문 리뷰',
    'home.paperReviewsDesc': 'reference 순서로 연결해 정리한 논문 리뷰입니다.',
    'home.allPapers': '모든 논문 리뷰 보기',
    'home.series': '시리즈',

    'common.readMore': '더 보기',
    'common.postsCount': '{count}편',

    'insight.title': '블로그',
    'insight.subtitle': '전체 글을 시간순으로 모았습니다. (총 {count}편)',
    'pagination.newer': '← 최신',
    'pagination.older': '이전 →',

    'post.readingTime': '{count}분 읽기',
    'post.seriesOther': '{series} 시리즈의 다른 글',

    'series.badge': '시리즈',
    'series.sub': '{count}편 · 오래된 순서',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': '논문 리뷰',
    'papers.sub': '카테고리 → 세부 주제로 나누고, 각 주제 안에서는 참고(reference) 순서대로 논문을 연결했습니다. 선행 논문을 먼저 읽고 따라 내려오면 한 흐름으로 이어집니다.',
    'papers.stat': '{count}편 · {cats}개 카테고리',
    'papers.empty': '아직 등록된 논문 리뷰가 없습니다.',

    'paper.crumbRoot': '논문 리뷰',
    'paper.prereq': '먼저 읽으면 좋은 선행 리뷰',
    'paper.citedBy': '이 논문을 기반으로 한 후속 리뷰',
    'paper.basedOn': '기반',

    'tags.title': '태그',
    'tags.sub': '포스트에 붙일 핵심 분류 태그를 고정하고, 세부 태그는 보조적으로 함께 씁니다.',
    'tags.coreTitle': '핵심 분류',
    'tags.standardTitle': '표준 세부 태그',
    'tags.standardSub': '학회명과 회사명은 분야 태그 뒤에 붙여 출처와 맥락을 고정합니다.',
    'tags.conferences': '탑티어 학회',
    'tags.conferencesDesc': '논문 리뷰나 연구 동향 글에 venue 태그로 붙입니다.',
    'tags.orgs': '회사/연구소',
    'tags.orgsDesc': '모델, 논문, 제품을 만든 조직이나 주요 연구 주체를 표시합니다.',
    'tags.extraTitle': '기타 세부 태그',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} items',
    'tag.representative': '대표 연구자',
    'tag.yearArchive': '연도별 정리',
    'tag.blogPosts': '블로그 글',
    'tag.paperReviews': '논문 리뷰',
    'tag.countLine': '블로그 {posts}편 · 논문 리뷰 {papers}편 (총 {total}편)',
    'tag.empty': '아직 이 분류가 달린 글은 없습니다. 새 포스트 frontmatter의 tags에 {tag}를 추가하면 이곳에 모입니다.',

    'about.title': '소개',
    'about.authorLabel': '블로그 게시자',
    'about.interestsLabel': '관심분야',
    'about.contactLabel': '연락처',
    'about.comments': '각 글 하단에 댓글을 남길 수 있습니다.',

    'search.title': '검색',
    'search.sub': '제목과 본문에서 검색합니다.',
    'search.placeholder': '검색어를 입력하세요',
    'search.zeroResults': '"[SEARCH_TERM]"에 대한 결과가 없습니다',
    'search.hint': '검색 인덱스는 npm run build 후 생성됩니다. 로컬 dev 모드에서는 동작하지 않을 수 있습니다.',

    'comments.title': '댓글',

    'toc.title': '목차',
    'callout.tldr': 'TL;DR',
    'callout.prereq': '사전 지식',
    'callout.pitfall': '주의 / 삽질 노트',
    'callout.note': 'Note',

    'error.title': '페이지를 찾을 수 없습니다',
    'error.lead': '요청하신 URL의 페이지가 존재하지 않습니다.',
    'error.home': '홈으로',
    'error.posts': '글 목록',
  },

  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.papers': 'Papers',
    'nav.tags': 'Tags',
    'nav.about': 'About',

    'site.tagline': 'for Study & Insight',
    'site.description': 'A technical blog exploring AI, reinforcement learning, and data science in depth.',
    'site.intro': 'I study and document AI, reinforcement learning, and data science.',

    'langSwitcher.label': 'Language',

    'home.ctaBlog': 'Blog posts',
    'home.ctaPapers': 'Paper reviews',
    'home.featured': 'Featured',
    'home.recentPosts': 'Recent posts',
    'home.allPosts': 'View all posts',
    'home.paperReviews': 'Paper reviews',
    'home.paperReviewsDesc': 'Paper reviews connected in reference order.',
    'home.allPapers': 'View all paper reviews',
    'home.series': 'Series',

    'common.readMore': 'Read more',
    'common.postsCount': '{count} posts',

    'insight.title': 'Blog',
    'insight.subtitle': 'All posts in chronological order. ({count} total)',
    'pagination.newer': '← Newer',
    'pagination.older': 'Older →',

    'post.readingTime': '{count} min read',
    'post.seriesOther': 'More in the {series} series',

    'series.badge': 'Series',
    'series.sub': '{count} posts · oldest first',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': 'Paper reviews',
    'papers.sub': 'Organized by category and sub-topic. Within each topic the papers are connected in reference order, so you can read the prerequisites first and follow the thread downward.',
    'papers.stat': '{count} reviews · {cats} categories',
    'papers.empty': 'No paper reviews have been added yet.',

    'paper.crumbRoot': 'Paper reviews',
    'paper.prereq': 'Recommended prerequisite reviews',
    'paper.citedBy': 'Follow-up reviews building on this one',
    'paper.basedOn': 'Based on',

    'tags.title': 'Tags',
    'tags.sub': 'Core category tags anchor each post; sub-tags are used as supporting labels.',
    'tags.coreTitle': 'Core categories',
    'tags.standardTitle': 'Standard sub-tags',
    'tags.standardSub': 'Conference and company names go after the topic tags to fix the source and context.',
    'tags.conferences': 'Top-tier conferences',
    'tags.conferencesDesc': 'Used as venue tags on paper reviews and research-trend posts.',
    'tags.orgs': 'Companies / labs',
    'tags.orgsDesc': 'Marks the organization or key research entity behind a model, paper, or product.',
    'tags.extraTitle': 'Other sub-tags',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} items',
    'tag.representative': 'Representative researchers',
    'tag.yearArchive': 'By year',
    'tag.blogPosts': 'Blog posts',
    'tag.paperReviews': 'Paper reviews',
    'tag.countLine': '{posts} posts · {papers} paper reviews ({total} total)',
    'tag.empty': 'No posts carry this category yet. Add {tag} to the tags in a post\u2019s frontmatter and it will show up here.',

    'about.title': 'About',
    'about.authorLabel': 'Author',
    'about.interestsLabel': 'Interests',
    'about.contactLabel': 'Contact',
    'about.comments': 'You can leave a comment at the bottom of each post.',

    'search.title': 'Search',
    'search.sub': 'Search across titles and content.',
    'search.placeholder': 'Type to search',
    'search.zeroResults': 'No results for "[SEARCH_TERM]"',
    'search.hint': 'The search index is generated after npm run build. It may not work in local dev mode.',

    'comments.title': 'Comments',

    'toc.title': 'Contents',
    'callout.tldr': 'TL;DR',
    'callout.prereq': 'Prerequisites',
    'callout.pitfall': 'Pitfalls / notes',
    'callout.note': 'Note',

    'error.title': 'Page not found',
    'error.lead': 'The page for the requested URL does not exist.',
    'error.home': 'Go home',
    'error.posts': 'All posts',
  },

  es: {
    'nav.home': 'Inicio',
    'nav.blog': 'Blog',
    'nav.papers': 'Reseñas',
    'nav.tags': 'Etiquetas',
    'nav.about': 'Acerca de',

    'site.tagline': 'for Study & Insight',
    'site.description': 'Un blog técnico que explora en profundidad la IA, el aprendizaje por refuerzo y la ciencia de datos.',
    'site.intro': 'Estudio y documento IA, aprendizaje por refuerzo y ciencia de datos.',

    'langSwitcher.label': 'Idioma',

    'home.ctaBlog': 'Entradas del blog',
    'home.ctaPapers': 'Reseñas de artículos',
    'home.featured': 'Destacados',
    'home.recentPosts': 'Entradas recientes',
    'home.allPosts': 'Ver todas las entradas',
    'home.paperReviews': 'Reseñas de artículos',
    'home.paperReviewsDesc': 'Reseñas enlazadas en orden de referencia.',
    'home.allPapers': 'Ver todas las reseñas',
    'home.series': 'Series',

    'common.readMore': 'Leer más',
    'common.postsCount': '{count} entradas',

    'insight.title': 'Blog',
    'insight.subtitle': 'Todas las entradas en orden cronológico. ({count} en total)',
    'pagination.newer': '← Más recientes',
    'pagination.older': 'Más antiguas →',

    'post.readingTime': '{count} min de lectura',
    'post.seriesOther': 'Más en la serie {series}',

    'series.badge': 'Serie',
    'series.sub': '{count} entradas · de la más antigua',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': 'Reseñas de artículos',
    'papers.sub': 'Organizadas por categoría y subtema. Dentro de cada tema, los artículos se enlazan en orden de referencia: lee primero los trabajos previos y sigue el hilo hacia abajo.',
    'papers.stat': '{count} reseñas · {cats} categorías',
    'papers.empty': 'Todavía no se han añadido reseñas de artículos.',

    'paper.crumbRoot': 'Reseñas',
    'paper.prereq': 'Reseñas previas recomendadas',
    'paper.citedBy': 'Reseñas posteriores basadas en esta',
    'paper.basedOn': 'Basado en',

    'tags.title': 'Etiquetas',
    'tags.sub': 'Las etiquetas de categoría principales anclan cada entrada; las subetiquetas se usan como etiquetas complementarias.',
    'tags.coreTitle': 'Categorías principales',
    'tags.standardTitle': 'Subetiquetas estándar',
    'tags.standardSub': 'Los nombres de congresos y empresas van después de las etiquetas temáticas para fijar la fuente y el contexto.',
    'tags.conferences': 'Congresos de primer nivel',
    'tags.conferencesDesc': 'Se usan como etiquetas de sede (venue) en reseñas y entradas sobre tendencias.',
    'tags.orgs': 'Empresas / laboratorios',
    'tags.orgsDesc': 'Indica la organización o el actor de investigación clave detrás de un modelo, artículo o producto.',
    'tags.extraTitle': 'Otras subetiquetas',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} elementos',
    'tag.representative': 'Investigadores representativos',
    'tag.yearArchive': 'Por año',
    'tag.blogPosts': 'Entradas del blog',
    'tag.paperReviews': 'Reseñas de artículos',
    'tag.countLine': '{posts} entradas · {papers} reseñas ({total} en total)',
    'tag.empty': 'Todavía ninguna entrada lleva esta categoría. Añade {tag} a las tags en el frontmatter de una entrada y aparecerá aquí.',

    'about.title': 'Acerca de',
    'about.authorLabel': 'Autor del blog',
    'about.interestsLabel': 'Intereses',
    'about.contactLabel': 'Contacto',
    'about.comments': 'Puedes dejar un comentario al final de cada entrada.',

    'search.title': 'Buscar',
    'search.sub': 'Busca en títulos y contenido.',
    'search.placeholder': 'Escribe para buscar',
    'search.zeroResults': 'No hay resultados para "[SEARCH_TERM]"',
    'search.hint': 'El índice de búsqueda se genera tras npm run build. Puede no funcionar en el modo dev local.',

    'comments.title': 'Comentarios',

    'toc.title': 'Índice',
    'callout.tldr': 'TL;DR',
    'callout.prereq': 'Requisitos previos',
    'callout.pitfall': 'Trampas / notas',
    'callout.note': 'Nota',

    'error.title': 'Página no encontrada',
    'error.lead': 'La página de la URL solicitada no existe.',
    'error.home': 'Ir al inicio',
    'error.posts': 'Lista de entradas',
  },

  ja: {
    'nav.home': 'ホーム',
    'nav.blog': 'ブログ',
    'nav.papers': '論文レビュー',
    'nav.tags': 'タグ',
    'nav.about': '紹介',

    'site.tagline': 'for Study & Insight',
    'site.description': '人工知能・強化学習・データサイエンスを深く掘り下げる技術ブログ。',
    'site.intro': '人工知能・強化学習・データサイエンスを学び、記録しています。',

    'langSwitcher.label': '言語',

    'home.ctaBlog': 'ブログ記事',
    'home.ctaPapers': '論文レビュー',
    'home.featured': 'おすすめ記事',
    'home.recentPosts': '最近の記事',
    'home.allPosts': 'すべての記事を見る',
    'home.paperReviews': '論文レビュー',
    'home.paperReviewsDesc': 'reference の順序でつないで整理した論文レビューです。',
    'home.allPapers': 'すべての論文レビューを見る',
    'home.series': 'シリーズ',

    'common.readMore': '続きを読む',
    'common.postsCount': '{count}件',

    'insight.title': 'ブログ',
    'insight.subtitle': 'すべての記事を時系列でまとめています。(全{count}件)',
    'pagination.newer': '← 新しい',
    'pagination.older': '古い →',

    'post.readingTime': '約{count}分',
    'post.seriesOther': '{series} シリーズの他の記事',

    'series.badge': 'シリーズ',
    'series.sub': '{count}件 · 古い順',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': '論文レビュー',
    'papers.sub': 'カテゴリ → 詳細トピックに分け、各トピック内では参考(reference)の順に論文をつないでいます。先行論文から読み進めると一つの流れになります。',
    'papers.stat': '{count}件 · {cats}カテゴリ',
    'papers.empty': 'まだ論文レビューは登録されていません。',

    'paper.crumbRoot': '論文レビュー',
    'paper.prereq': '先に読むとよい先行レビュー',
    'paper.citedBy': 'この論文を基にした後続レビュー',
    'paper.basedOn': '基盤',

    'tags.title': 'タグ',
    'tags.sub': '投稿に付ける主要な分類タグを固定し、詳細タグは補助的に併用します。',
    'tags.coreTitle': '主要分類',
    'tags.standardTitle': '標準の詳細タグ',
    'tags.standardSub': '学会名・企業名は分野タグの後ろに付けて、出典と文脈を固定します。',
    'tags.conferences': 'トップ学会',
    'tags.conferencesDesc': '論文レビューや研究動向の記事に venue タグとして付けます。',
    'tags.orgs': '企業 / 研究所',
    'tags.orgsDesc': 'モデル・論文・製品を作った組織や主要な研究主体を示します。',
    'tags.extraTitle': 'その他の詳細タグ',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} 件',
    'tag.representative': '代表的な研究者',
    'tag.yearArchive': '年別まとめ',
    'tag.blogPosts': 'ブログ記事',
    'tag.paperReviews': '論文レビュー',
    'tag.countLine': 'ブログ {posts}件 · 論文レビュー {papers}件 (全{total}件)',
    'tag.empty': 'まだこの分類が付いた記事はありません。新しい記事の frontmatter の tags に {tag} を追加すると、ここに集まります。',

    'about.title': '紹介',
    'about.authorLabel': 'ブログ運営者',
    'about.interestsLabel': '関心分野',
    'about.contactLabel': '連絡先',
    'about.comments': '各記事の下部にコメントを残せます。',

    'search.title': '検索',
    'search.sub': 'タイトルと本文から検索します。',
    'search.placeholder': '検索語を入力してください',
    'search.zeroResults': '"[SEARCH_TERM]" に一致する結果がありません',
    'search.hint': '検索インデックスは npm run build の後に生成されます。ローカルの dev モードでは動作しない場合があります。',

    'comments.title': 'コメント',

    'toc.title': '目次',
    'callout.tldr': 'TL;DR',
    'callout.prereq': '前提知識',
    'callout.pitfall': '注意 / ハマりどころ',
    'callout.note': 'Note',

    'error.title': 'ページが見つかりません',
    'error.lead': 'お探しの URL のページは存在しません。',
    'error.home': 'ホームへ',
    'error.posts': '記事一覧',
  },

  zh: {
    'nav.home': '首页',
    'nav.blog': '博客',
    'nav.papers': '论文评述',
    'nav.tags': '标签',
    'nav.about': '关于',

    'site.tagline': 'for Study & Insight',
    'site.description': '深入探讨人工智能、强化学习与数据科学的技术博客。',
    'site.intro': '学习并记录人工智能、强化学习与数据科学。',

    'langSwitcher.label': '语言',

    'home.ctaBlog': '博客文章',
    'home.ctaPapers': '论文评述',
    'home.featured': '精选文章',
    'home.recentPosts': '最新文章',
    'home.allPosts': '查看全部文章',
    'home.paperReviews': '论文评述',
    'home.paperReviewsDesc': '按 reference 顺序串联整理的论文评述。',
    'home.allPapers': '查看全部论文评述',
    'home.series': '系列',

    'common.readMore': '阅读更多',
    'common.postsCount': '{count} 篇',

    'insight.title': '博客',
    'insight.subtitle': '按时间顺序汇总的全部文章。(共 {count} 篇)',
    'pagination.newer': '← 更新',
    'pagination.older': '更早 →',

    'post.readingTime': '阅读约 {count} 分钟',
    'post.seriesOther': '{series} 系列的其他文章',

    'series.badge': '系列',
    'series.sub': '{count} 篇 · 从旧到新',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': '论文评述',
    'papers.sub': '按类别 → 子主题划分，每个主题内按参考(reference)顺序串联论文。先读前置论文再顺流而下，即可形成一条主线。',
    'papers.stat': '{count} 篇 · {cats} 个类别',
    'papers.empty': '尚未添加论文评述。',

    'paper.crumbRoot': '论文评述',
    'paper.prereq': '建议先阅读的前置评述',
    'paper.citedBy': '基于本文的后续评述',
    'paper.basedOn': '基于',

    'tags.title': '标签',
    'tags.sub': '为文章固定核心分类标签，细分标签作为辅助标注。',
    'tags.coreTitle': '核心分类',
    'tags.standardTitle': '标准细分标签',
    'tags.standardSub': '会议名与公司名放在领域标签之后，以固定来源与语境。',
    'tags.conferences': '顶级会议',
    'tags.conferencesDesc': '作为 venue 标签用于论文评述或研究动态文章。',
    'tags.orgs': '公司 / 研究机构',
    'tags.orgsDesc': '标注创建模型、论文或产品的组织或主要研究主体。',
    'tags.extraTitle': '其他细分标签',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} 项',
    'tag.representative': '代表性研究者',
    'tag.yearArchive': '按年份整理',
    'tag.blogPosts': '博客文章',
    'tag.paperReviews': '论文评述',
    'tag.countLine': '博客 {posts} 篇 · 论文评述 {papers} 篇 (共 {total} 篇)',
    'tag.empty': '尚无带有该分类的文章。在新文章 frontmatter 的 tags 中加入 {tag}，即可汇总到此处。',

    'about.title': '关于',
    'about.authorLabel': '博客作者',
    'about.interestsLabel': '关注领域',
    'about.contactLabel': '联系方式',
    'about.comments': '可在每篇文章底部留言。',

    'search.title': '搜索',
    'search.sub': '在标题和正文中搜索。',
    'search.placeholder': '请输入搜索词',
    'search.zeroResults': '没有关于 "[SEARCH_TERM]" 的结果',
    'search.hint': '搜索索引在 npm run build 之后生成。本地 dev 模式下可能无法使用。',

    'comments.title': '评论',

    'toc.title': '目录',
    'callout.tldr': 'TL;DR',
    'callout.prereq': '前置知识',
    'callout.pitfall': '注意 / 踩坑记录',
    'callout.note': 'Note',

    'error.title': '未找到页面',
    'error.lead': '所请求 URL 的页面不存在。',
    'error.home': '返回首页',
    'error.posts': '文章列表',
  },

  ru: {
    'nav.home': 'Главная',
    'nav.blog': 'Блог',
    'nav.papers': 'Разборы статей',
    'nav.tags': 'Теги',
    'nav.about': 'О сайте',

    'site.tagline': 'for Study & Insight',
    'site.description': 'Технический блог, глубоко разбирающий ИИ, обучение с подкреплением и науку о данных.',
    'site.intro': 'Изучаю и документирую ИИ, обучение с подкреплением и науку о данных.',

    'langSwitcher.label': 'Язык',

    'home.ctaBlog': 'Записи блога',
    'home.ctaPapers': 'Разборы статей',
    'home.featured': 'Избранное',
    'home.recentPosts': 'Последние записи',
    'home.allPosts': 'Все записи',
    'home.paperReviews': 'Разборы статей',
    'home.paperReviewsDesc': 'Разборы статей, связанные в порядке ссылок (reference).',
    'home.allPapers': 'Все разборы статей',
    'home.series': 'Серии',

    'common.readMore': 'Читать далее',
    'common.postsCount': '{count} записей',

    'insight.title': 'Блог',
    'insight.subtitle': 'Все записи в хронологическом порядке. (всего {count})',
    'pagination.newer': '← Новее',
    'pagination.older': 'Старее →',

    'post.readingTime': '{count} мин чтения',
    'post.seriesOther': 'Другие записи серии {series}',

    'series.badge': 'Серия',
    'series.sub': '{count} записей · от старых к новым',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': 'Разборы статей',
    'papers.sub': 'Разбито по категориям и подтемам. Внутри каждой темы статьи связаны в порядке ссылок (reference): сначала читаются предшествующие работы, затем нить ведёт вниз.',
    'papers.stat': '{count} разборов · {cats} категорий',
    'papers.empty': 'Разборы статей пока не добавлены.',

    'paper.crumbRoot': 'Разборы статей',
    'paper.prereq': 'Рекомендуемые предшествующие разборы',
    'paper.citedBy': 'Последующие разборы, опирающиеся на этот',
    'paper.basedOn': 'Основано на',

    'tags.title': 'Теги',
    'tags.sub': 'Основные теги-категории закрепляют каждую запись; подтеги используются как вспомогательные метки.',
    'tags.coreTitle': 'Основные категории',
    'tags.standardTitle': 'Стандартные подтеги',
    'tags.standardSub': 'Названия конференций и компаний ставятся после тематических тегов, чтобы зафиксировать источник и контекст.',
    'tags.conferences': 'Топовые конференции',
    'tags.conferencesDesc': 'Используются как теги площадки (venue) в разборах статей и обзорах трендов.',
    'tags.orgs': 'Компании / лаборатории',
    'tags.orgsDesc': 'Отмечает организацию или ключевого исследователя, стоящего за моделью, статьёй или продуктом.',
    'tags.extraTitle': 'Прочие подтеги',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} элементов',
    'tag.representative': 'Ключевые исследователи',
    'tag.yearArchive': 'По годам',
    'tag.blogPosts': 'Записи блога',
    'tag.paperReviews': 'Разборы статей',
    'tag.countLine': 'Записей: {posts} · Разборов статей: {papers} (всего {total})',
    'tag.empty': 'Пока нет записей с этой категорией. Добавьте {tag} в поле tags в frontmatter записи — и она появится здесь.',

    'about.title': 'О сайте',
    'about.authorLabel': 'Автор блога',
    'about.interestsLabel': 'Интересы',
    'about.contactLabel': 'Контакты',
    'about.comments': 'Комментарий можно оставить внизу каждой записи.',

    'search.title': 'Поиск',
    'search.sub': 'Поиск по заголовкам и тексту.',
    'search.placeholder': 'Введите запрос',
    'search.zeroResults': 'Нет результатов по запросу "[SEARCH_TERM]"',
    'search.hint': 'Поисковый индекс создаётся после npm run build. В локальном режиме dev он может не работать.',

    'comments.title': 'Комментарии',

    'toc.title': 'Содержание',
    'callout.tldr': 'TL;DR',
    'callout.prereq': 'Предпосылки',
    'callout.pitfall': 'Подводные камни / заметки',
    'callout.note': 'Заметка',

    'error.title': 'Страница не найдена',
    'error.lead': 'Страница по запрошенному URL не существует.',
    'error.home': 'На главную',
    'error.posts': 'Список записей',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.blog': 'Blog',
    'nav.papers': 'Analyses',
    'nav.tags': 'Tags',
    'nav.about': 'À propos',

    'site.tagline': 'for Study & Insight',
    'site.description': 'Un blog technique explorant en profondeur l\u2019IA, l\u2019apprentissage par renforcement et la science des données.',
    'site.intro': 'J\u2019étudie et je documente l\u2019IA, l\u2019apprentissage par renforcement et la science des données.',

    'langSwitcher.label': 'Langue',

    'home.ctaBlog': 'Articles de blog',
    'home.ctaPapers': 'Analyses d\u2019articles',
    'home.featured': 'À la une',
    'home.recentPosts': 'Articles récents',
    'home.allPosts': 'Voir tous les articles',
    'home.paperReviews': 'Analyses d\u2019articles',
    'home.paperReviewsDesc': 'Analyses reliées dans l\u2019ordre des références.',
    'home.allPapers': 'Voir toutes les analyses',
    'home.series': 'Séries',

    'common.readMore': 'Lire la suite',
    'common.postsCount': '{count} articles',

    'insight.title': 'Blog',
    'insight.subtitle': 'Tous les articles par ordre chronologique. ({count} au total)',
    'pagination.newer': '← Plus récents',
    'pagination.older': 'Plus anciens →',

    'post.readingTime': '{count} min de lecture',
    'post.seriesOther': 'Autres articles de la série {series}',

    'series.badge': 'Série',
    'series.sub': '{count} articles · du plus ancien',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': 'Analyses d\u2019articles',
    'papers.sub': 'Organisées par catégorie et sous-thème. Au sein de chaque thème, les articles sont reliés dans l\u2019ordre des références : lisez d\u2019abord les travaux antérieurs, puis suivez le fil.',
    'papers.stat': '{count} analyses · {cats} catégories',
    'papers.empty': 'Aucune analyse d\u2019article pour le moment.',

    'paper.crumbRoot': 'Analyses',
    'paper.prereq': 'Analyses préalables recommandées',
    'paper.citedBy': 'Analyses ultérieures fondées sur celle-ci',
    'paper.basedOn': 'Basé sur',

    'tags.title': 'Tags',
    'tags.sub': 'Les tags de catégorie principaux ancrent chaque article ; les sous-tags servent d\u2019étiquettes complémentaires.',
    'tags.coreTitle': 'Catégories principales',
    'tags.standardTitle': 'Sous-tags standard',
    'tags.standardSub': 'Les noms de conférences et d\u2019entreprises se placent après les tags de domaine pour fixer la source et le contexte.',
    'tags.conferences': 'Conférences de premier plan',
    'tags.conferencesDesc': 'Utilisés comme tags de lieu (venue) sur les analyses et les articles de tendances.',
    'tags.orgs': 'Entreprises / laboratoires',
    'tags.orgsDesc': 'Indique l\u2019organisation ou l\u2019acteur clé derrière un modèle, un article ou un produit.',
    'tags.extraTitle': 'Autres sous-tags',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} éléments',
    'tag.representative': 'Chercheurs représentatifs',
    'tag.yearArchive': 'Par année',
    'tag.blogPosts': 'Articles de blog',
    'tag.paperReviews': 'Analyses d\u2019articles',
    'tag.countLine': '{posts} articles · {papers} analyses ({total} au total)',
    'tag.empty': 'Aucun article ne porte encore cette catégorie. Ajoutez {tag} aux tags dans le frontmatter d\u2019un article pour le voir apparaître ici.',

    'about.title': 'À propos',
    'about.authorLabel': 'Auteur du blog',
    'about.interestsLabel': 'Centres d\u2019intérêt',
    'about.contactLabel': 'Contact',
    'about.comments': 'Vous pouvez laisser un commentaire au bas de chaque article.',

    'search.title': 'Recherche',
    'search.sub': 'Recherche dans les titres et le contenu.',
    'search.placeholder': 'Saisissez votre recherche',
    'search.zeroResults': 'Aucun résultat pour "[SEARCH_TERM]"',
    'search.hint': 'L\u2019index de recherche est généré après npm run build. Il peut ne pas fonctionner en mode dev local.',

    'comments.title': 'Commentaires',

    'toc.title': 'Sommaire',
    'callout.tldr': 'TL;DR',
    'callout.prereq': 'Prérequis',
    'callout.pitfall': 'Pièges / notes',
    'callout.note': 'Note',

    'error.title': 'Page introuvable',
    'error.lead': 'La page correspondant à l\u2019URL demandée n\u2019existe pas.',
    'error.home': 'Accueil',
    'error.posts': 'Liste des articles',
  },

  de: {
    'nav.home': 'Start',
    'nav.blog': 'Blog',
    'nav.papers': 'Paper-Reviews',
    'nav.tags': 'Tags',
    'nav.about': 'Über',

    'site.tagline': 'for Study & Insight',
    'site.description': 'Ein technischer Blog, der KI, Reinforcement Learning und Data Science vertieft behandelt.',
    'site.intro': 'Ich lerne und dokumentiere KI, Reinforcement Learning und Data Science.',

    'langSwitcher.label': 'Sprache',

    'home.ctaBlog': 'Blogbeiträge',
    'home.ctaPapers': 'Paper-Reviews',
    'home.featured': 'Empfohlen',
    'home.recentPosts': 'Neueste Beiträge',
    'home.allPosts': 'Alle Beiträge ansehen',
    'home.paperReviews': 'Paper-Reviews',
    'home.paperReviewsDesc': 'Paper-Reviews, in Referenzreihenfolge verknüpft.',
    'home.allPapers': 'Alle Paper-Reviews ansehen',
    'home.series': 'Serien',

    'common.readMore': 'Weiterlesen',
    'common.postsCount': '{count} Beiträge',

    'insight.title': 'Blog',
    'insight.subtitle': 'Alle Beiträge in chronologischer Reihenfolge. (insgesamt {count})',
    'pagination.newer': '← Neuer',
    'pagination.older': 'Älter →',

    'post.readingTime': '{count} Min. Lesezeit',
    'post.seriesOther': 'Weitere Beiträge der Serie {series}',

    'series.badge': 'Serie',
    'series.sub': '{count} Beiträge · älteste zuerst',

    'papers.kicker': 'PAPER REVIEWS',
    'papers.title': 'Paper-Reviews',
    'papers.sub': 'Nach Kategorie und Unterthema geordnet. Innerhalb jedes Themas sind die Paper in Referenzreihenfolge verknüpft: zuerst die Vorarbeiten lesen und dann dem Faden folgen.',
    'papers.stat': '{count} Reviews · {cats} Kategorien',
    'papers.empty': 'Es wurden noch keine Paper-Reviews hinzugefügt.',

    'paper.crumbRoot': 'Paper-Reviews',
    'paper.prereq': 'Empfohlene vorausgehende Reviews',
    'paper.citedBy': 'Nachfolgende Reviews, die darauf aufbauen',
    'paper.basedOn': 'Basiert auf',

    'tags.title': 'Tags',
    'tags.sub': 'Kern-Kategorietags verankern jeden Beitrag; Unter-Tags dienen als ergänzende Labels.',
    'tags.coreTitle': 'Kernkategorien',
    'tags.standardTitle': 'Standard-Unter-Tags',
    'tags.standardSub': 'Konferenz- und Firmennamen stehen hinter den Themen-Tags, um Quelle und Kontext festzulegen.',
    'tags.conferences': 'Top-Konferenzen',
    'tags.conferencesDesc': 'Werden als Venue-Tags bei Paper-Reviews und Trendbeiträgen verwendet.',
    'tags.orgs': 'Unternehmen / Labore',
    'tags.orgsDesc': 'Kennzeichnet die Organisation oder den zentralen Forschungsträger hinter einem Modell, Paper oder Produkt.',
    'tags.extraTitle': 'Weitere Unter-Tags',

    'tag.kindConference': 'CONFERENCE',
    'tag.kindOrganization': 'ORGANIZATION',
    'tag.items': '{count} Einträge',
    'tag.representative': 'Repräsentative Forschende',
    'tag.yearArchive': 'Nach Jahr',
    'tag.blogPosts': 'Blogbeiträge',
    'tag.paperReviews': 'Paper-Reviews',
    'tag.countLine': '{posts} Beiträge · {papers} Paper-Reviews (insgesamt {total})',
    'tag.empty': 'Noch trägt kein Beitrag diese Kategorie. Füge {tag} zu den tags im Frontmatter eines Beitrags hinzu, dann erscheint er hier.',

    'about.title': 'Über',
    'about.authorLabel': 'Blogautor',
    'about.interestsLabel': 'Interessen',
    'about.contactLabel': 'Kontakt',
    'about.comments': 'Unter jedem Beitrag kannst du einen Kommentar hinterlassen.',

    'search.title': 'Suche',
    'search.sub': 'Suche in Titeln und Inhalten.',
    'search.placeholder': 'Suchbegriff eingeben',
    'search.zeroResults': 'Keine Ergebnisse für "[SEARCH_TERM]"',
    'search.hint': 'Der Suchindex wird nach npm run build erstellt. Im lokalen Dev-Modus funktioniert er möglicherweise nicht.',

    'comments.title': 'Kommentare',

    'toc.title': 'Inhalt',
    'callout.tldr': 'TL;DR',
    'callout.prereq': 'Voraussetzungen',
    'callout.pitfall': 'Fallstricke / Notizen',
    'callout.note': 'Notiz',

    'error.title': 'Seite nicht gefunden',
    'error.lead': 'Die Seite zur angeforderten URL existiert nicht.',
    'error.home': 'Zur Startseite',
    'error.posts': 'Beitragsliste',
  },
} as const;

export type UIKey = keyof (typeof ui)['ko'];

export function useTranslations(locale: Locale) {
  const dict = ui[locale] ?? ui[DEFAULT_LOCALE];
  const fallback = ui[DEFAULT_LOCALE];
  return function t(key: UIKey, params?: Record<string, string | number>): string {
    const template = (dict as Record<string, string>)[key] ?? fallback[key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      params[name] !== undefined ? String(params[name]) : `{${name}}`,
    );
  };
}
