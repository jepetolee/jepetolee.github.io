export const TOPIC_TAGS = [
  {
    tag: '자연어 처리',
    description: '텍스트, 언어 모델, 토큰화, 임베딩, 번역과 생성.',
  },
  {
    tag: '컴퓨터 비전',
    description: '이미지와 비디오 인식, 생성, 검출, 분할 모델.',
  },
  {
    tag: 'ASR',
    description: '음성 인식, 오디오 전사, speech-to-text 시스템.',
  },
  {
    tag: '강화학습',
    description: '보상, 정책, 가치 함수, 환경 상호작용과 제어.',
  },
  {
    tag: '추론 모델',
    description: '논리 추론, 문제 풀이, 계획, chain-of-thought 계열 모델.',
  },
  {
    tag: '인공신경망',
    description: '신경망 구조, 표현 학습, 최적화, 학습 안정화.',
  },
  {
    tag: 'SNN',
    description: 'Spiking Neural Network와 뉴로모픽 계산.',
  },
  {
    tag: '정보이론',
    description: '엔트로피, 상호정보량, 압축, 부호화와 불확실성.',
  },
  {
    tag: '머신 러닝',
    description: '일반적인 ML 방법론, 평가, 모델링, 실험 설계.',
  },
  {
    tag: '데이터셋',
    description: '데이터 구축, 정제, 벤치마크, 라벨링과 분석.',
  },
  {
    tag: '에이전트 AI',
    description: '도구 사용, 계획, 메모리, 멀티 에이전트 워크플로.',
  },
  {
    tag: '월드 모델',
    description: '환경 동역학, 잠재 시뮬레이터, model-based RL.',
  },
  {
    tag: '라이브러리',
    description: '프레임워크, 패키지, 구현 도구와 개발 경험.',
  },
] as const;

export type TopicTag = (typeof TOPIC_TAGS)[number]['tag'];

export const TOPIC_TAG_NAMES = TOPIC_TAGS.map(({ tag }) => tag);

export const CONFERENCE_TAGS = [
  'NeurIPS',
  'ICML',
  'ICLR',
  'CVPR',
  'ICCV',
  'ECCV',
  'ACL',
  'EMNLP',
  'NAACL',
  'KDD',
  'SIGGRAPH',
  'CHI',
  'WWW',
  'SIGMOD',
  'VLDB',
  'SOSP',
  'OSDI',
  'NSDI',
  'SIGCOMM',
  'PLDI',
  'POPL',
  'FOCS',
  'STOC',
  'CCS',
  'USENIX Security',
  'IEEE S&P',
] as const;

export const COMPANY_TAGS = [
  'OpenAI',
  'Google DeepMind',
  'Google Research',
  'Anthropic',
  'Meta AI',
  'Microsoft Research',
  'NVIDIA',
  'Apple',
  'Amazon',
  'Hugging Face',
  'Mistral AI',
  'xAI',
  'Tesla',
  'IBM Research',
] as const;

type StandardTagMeta = {
  tag: string;
  kind: 'conference' | 'organization';
  description: string;
  representativeResearchers: string[];
};

export const STANDARD_TAG_METADATA: StandardTagMeta[] = [
  {
    tag: 'NeurIPS',
    kind: 'conference',
    description: '머신러닝, 신경망, 최적화, 강화학습을 아우르는 AI/ML 최상위 학회.',
    representativeResearchers: ['Geoffrey Hinton', 'Yoshua Bengio', 'Yann LeCun', 'Michael I. Jordan'],
  },
  {
    tag: 'ICML',
    kind: 'conference',
    description: '머신러닝 이론, 방법론, 응용 연구를 다루는 대표 ML 학회.',
    representativeResearchers: ['Michael I. Jordan', 'Andrew Ng', 'Zoubin Ghahramani', 'Bernhard Scholkopf'],
  },
  {
    tag: 'ICLR',
    kind: 'conference',
    description: '딥러닝 표현 학습, 생성 모델, 강화학습, 언어 모델 연구가 많이 모이는 학회.',
    representativeResearchers: ['Yoshua Bengio', 'Ian Goodfellow', 'Ilya Sutskever', 'Pieter Abbeel'],
  },
  {
    tag: 'CVPR',
    kind: 'conference',
    description: '컴퓨터 비전과 패턴 인식 분야의 대표 최상위 학회.',
    representativeResearchers: ['Fei-Fei Li', 'Jitendra Malik', 'Kaiming He', 'Ross Girshick'],
  },
  {
    tag: 'ICCV',
    kind: 'conference',
    description: '컴퓨터 비전 전반의 이론과 응용 연구를 다루는 격년제 최상위 학회.',
    representativeResearchers: ['Andrew Zisserman', 'Cordelia Schmid', 'Jitendra Malik', 'Kaiming He'],
  },
  {
    tag: 'ECCV',
    kind: 'conference',
    description: '유럽 중심의 컴퓨터 비전 최상위 학회.',
    representativeResearchers: ['Andrew Zisserman', 'Cordelia Schmid', 'Andrea Vedaldi', 'Vittorio Ferrari'],
  },
  {
    tag: 'ACL',
    kind: 'conference',
    description: '자연어 처리와 계산언어학 분야의 대표 학회.',
    representativeResearchers: ['Christopher Manning', 'Dan Jurafsky', 'Regina Barzilay', 'Graham Neubig'],
  },
  {
    tag: 'EMNLP',
    kind: 'conference',
    description: '실험적 NLP, 언어 모델, 정보 추출, 생성 연구가 활발한 NLP 최상위 학회.',
    representativeResearchers: ['Dan Jurafsky', 'Kyunghyun Cho', 'Yoav Goldberg', 'Graham Neubig'],
  },
  {
    tag: 'NAACL',
    kind: 'conference',
    description: '북미 ACL 계열 자연어 처리 학회.',
    representativeResearchers: ['Christopher Manning', 'Regina Barzilay', 'Noah Smith', 'Luke Zettlemoyer'],
  },
  {
    tag: 'KDD',
    kind: 'conference',
    description: '데이터 마이닝, 지식 발견, 추천, 대규모 데이터 분석 분야의 대표 학회.',
    representativeResearchers: ['Jiawei Han', 'Jure Leskovec', 'Christos Faloutsos', 'Daphne Koller'],
  },
  {
    tag: 'SIGGRAPH',
    kind: 'conference',
    description: '컴퓨터 그래픽스, 렌더링, 시뮬레이션, 인터랙티브 미디어 분야의 최상위 학회.',
    representativeResearchers: ['Pat Hanrahan', 'Marc Levoy', 'Jos Stam', 'Steve Marschner'],
  },
  {
    tag: 'CHI',
    kind: 'conference',
    description: '인간-컴퓨터 상호작용과 사용자 경험 연구의 대표 학회.',
    representativeResearchers: ['Don Norman', 'Ben Shneiderman', 'Hiroshi Ishii', 'Wendy Mackay'],
  },
  {
    tag: 'WWW',
    kind: 'conference',
    description: '웹, 검색, 추천, 소셜 네트워크, 웹 데이터 연구를 다루는 대표 학회.',
    representativeResearchers: ['Tim Berners-Lee', 'Jure Leskovec', 'Soumen Chakrabarti', 'Ricardo Baeza-Yates'],
  },
  {
    tag: 'SIGMOD',
    kind: 'conference',
    description: '데이터베이스 시스템과 데이터 관리 분야의 최상위 학회.',
    representativeResearchers: ['Michael Stonebraker', 'Jim Gray', 'Hector Garcia-Molina', 'Jennifer Widom'],
  },
  {
    tag: 'VLDB',
    kind: 'conference',
    description: '대규모 데이터베이스, 데이터 관리, 분산 데이터 시스템 분야의 대표 학회.',
    representativeResearchers: ['Michael Stonebraker', 'Hector Garcia-Molina', 'Jennifer Widom', 'Surajit Chaudhuri'],
  },
  {
    tag: 'SOSP',
    kind: 'conference',
    description: '운영체제와 시스템 소프트웨어 분야의 최상위 학회.',
    representativeResearchers: ['Butler Lampson', 'Ken Thompson', 'Barbara Liskov', 'Margo Seltzer'],
  },
  {
    tag: 'OSDI',
    kind: 'conference',
    description: '운영체제 설계와 구현, 분산 시스템, 클라우드 인프라 연구를 다루는 대표 학회.',
    representativeResearchers: ['Jeff Dean', 'Sanjay Ghemawat', 'Margo Seltzer', 'Ion Stoica'],
  },
  {
    tag: 'NSDI',
    kind: 'conference',
    description: '네트워크 시스템, 분산 시스템, 클라우드 인프라 분야의 대표 학회.',
    representativeResearchers: ['Ion Stoica', 'Nick McKeown', 'Hari Balakrishnan', 'Jennifer Rexford'],
  },
  {
    tag: 'SIGCOMM',
    kind: 'conference',
    description: '컴퓨터 네트워킹과 인터넷 아키텍처 분야의 최상위 학회.',
    representativeResearchers: ['Vint Cerf', 'Van Jacobson', 'Nick McKeown', 'Jennifer Rexford'],
  },
  {
    tag: 'PLDI',
    kind: 'conference',
    description: '프로그래밍 언어 설계와 구현 분야의 대표 학회.',
    representativeResearchers: ['Barbara Liskov', 'Guy L. Steele', 'Ras Bodik', 'Kathleen Fisher'],
  },
  {
    tag: 'POPL',
    kind: 'conference',
    description: '프로그래밍 언어 원리, 타입 시스템, 의미론 분야의 대표 학회.',
    representativeResearchers: ['Benjamin Pierce', 'Philip Wadler', 'Xavier Leroy', 'Andrew W. Appel'],
  },
  {
    tag: 'FOCS',
    kind: 'conference',
    description: '컴퓨터과학 이론, 알고리즘, 복잡도 분야의 대표 학회.',
    representativeResearchers: ['Richard Karp', 'Shafi Goldwasser', 'Avi Wigderson', 'Leslie Valiant'],
  },
  {
    tag: 'STOC',
    kind: 'conference',
    description: '이론 컴퓨터과학과 알고리즘 연구의 대표 학회.',
    representativeResearchers: ['Richard Karp', 'Shafi Goldwasser', 'Avi Wigderson', 'Leslie Valiant'],
  },
  {
    tag: 'CCS',
    kind: 'conference',
    description: '컴퓨터 보안, 프라이버시, 암호 시스템 분야의 대표 학회.',
    representativeResearchers: ['Dawn Song', 'Dan Boneh', 'Shafi Goldwasser', 'Adi Shamir'],
  },
  {
    tag: 'USENIX Security',
    kind: 'conference',
    description: '시스템 보안, 네트워크 보안, 프라이버시 분야의 대표 학회.',
    representativeResearchers: ['Dawn Song', 'Dan Boneh', 'Tadayoshi Kohno', 'Vern Paxson'],
  },
  {
    tag: 'IEEE S&P',
    kind: 'conference',
    description: '보안과 프라이버시 분야의 대표 최상위 학회.',
    representativeResearchers: ['Dawn Song', 'Dan Boneh', 'Vern Paxson', 'Adi Shamir'],
  },
  {
    tag: 'OpenAI',
    kind: 'organization',
    description: '대규모 언어 모델, 멀티모달 모델, RLHF, 추론 모델을 개발하는 AI 연구 조직.',
    representativeResearchers: ['Ilya Sutskever', 'John Schulman', 'Alec Radford', 'Wojciech Zaremba'],
  },
  {
    tag: 'Google DeepMind',
    kind: 'organization',
    description: '강화학습, 월드 모델, 단백질 구조 예측, 범용 AI 연구를 수행하는 Google 계열 연구 조직.',
    representativeResearchers: ['Demis Hassabis', 'David Silver', 'Koray Kavukcuoglu', 'Danijar Hafner'],
  },
  {
    tag: 'Google Research',
    kind: 'organization',
    description: '검색, 시스템, 언어 모델, 비전, ML 인프라 전반을 다루는 Google 연구 조직.',
    representativeResearchers: ['Jeff Dean', 'Ashish Vaswani', 'Noam Shazeer', 'Quoc Le'],
  },
  {
    tag: 'Anthropic',
    kind: 'organization',
    description: 'AI 안전성, 헌법적 AI, 대규모 언어 모델을 중심으로 연구하는 AI 기업.',
    representativeResearchers: ['Dario Amodei', 'Daniela Amodei', 'Jared Kaplan', 'Chris Olah'],
  },
  {
    tag: 'Meta AI',
    kind: 'organization',
    description: '오픈 모델, 컴퓨터 비전, 추천, 자기지도학습, 생성 AI 연구를 수행하는 Meta 연구 조직.',
    representativeResearchers: ['Yann LeCun', 'Joelle Pineau', 'Piotr Dollar', 'Ross Girshick'],
  },
  {
    tag: 'Microsoft Research',
    kind: 'organization',
    description: 'AI, 시스템, 프로그래밍 언어, HCI, 보안 등 컴퓨터과학 전반을 다루는 연구소.',
    representativeResearchers: ['Eric Horvitz', 'Jennifer Chayes', 'Christopher Bishop', 'Jianfeng Gao'],
  },
  {
    tag: 'NVIDIA',
    kind: 'organization',
    description: 'GPU 컴퓨팅, 딥러닝 인프라, 그래픽스, 생성 모델 가속을 다루는 기업.',
    representativeResearchers: ['Jensen Huang', 'Bill Dally', 'Bryan Catanzaro', 'Ming-Yu Liu'],
  },
  {
    tag: 'Apple',
    kind: 'organization',
    description: '온디바이스 ML, 음성, 비전, 프라이버시 보존 AI를 다루는 기업.',
    representativeResearchers: ['John Giannandrea', 'Samy Bengio', 'Ruoming Pang', 'Yann LeCun'],
  },
  {
    tag: 'Amazon',
    kind: 'organization',
    description: '클라우드 AI, 추천, 음성 비서, 대규모 ML 시스템을 다루는 기업.',
    representativeResearchers: ['Alex Smola', 'Rohit Prasad', 'Matt Wood', 'Bernhard Scholkopf'],
  },
  {
    tag: 'Hugging Face',
    kind: 'organization',
    description: '오픈소스 모델, 데이터셋, 평가, ML 도구 생태계를 운영하는 AI 플랫폼 기업.',
    representativeResearchers: ['Thomas Wolf', 'Clem Delangue', 'Julien Chaumond', 'Lysandre Debut'],
  },
  {
    tag: 'Mistral AI',
    kind: 'organization',
    description: '오픈 가중치와 효율적인 대규모 언어 모델을 개발하는 AI 기업.',
    representativeResearchers: ['Arthur Mensch', 'Timothee Lacroix', 'Guillaume Lample', 'Jean-Charles Samuelian'],
  },
  {
    tag: 'xAI',
    kind: 'organization',
    description: '대규모 언어 모델과 추론형 AI 시스템을 개발하는 AI 기업.',
    representativeResearchers: ['Elon Musk', 'Igor Babuschkin', 'Jimmy Ba', 'Toby Pohlen'],
  },
  {
    tag: 'Tesla',
    kind: 'organization',
    description: '자율주행, 로보틱스, 비전 기반 제어 시스템을 개발하는 기업.',
    representativeResearchers: ['Andrej Karpathy', 'Ashok Elluswamy', 'Elon Musk', 'Pete Bannon'],
  },
  {
    tag: 'IBM Research',
    kind: 'organization',
    description: 'AI, 양자컴퓨팅, 시스템, 반도체, 보안 연구를 수행하는 산업 연구소.',
    representativeResearchers: ['David Ferrucci', 'Ruchir Puri', 'Murray Campbell', 'Francesca Rossi'],
  },
];

export const STANDARD_TAG_GROUPS = [
  {
    title: '탑티어 학회',
    description: '논문 리뷰나 연구 동향 글에 venue 태그로 붙입니다.',
    tags: CONFERENCE_TAGS,
  },
  {
    title: '회사/연구소',
    description: '모델, 논문, 제품을 만든 조직이나 주요 연구 주체를 표시합니다.',
    tags: COMPANY_TAGS,
  },
] as const;

export const CANONICAL_TAG_NAMES: readonly string[] = [
  ...TOPIC_TAG_NAMES,
  ...CONFERENCE_TAGS,
  ...COMPANY_TAGS,
];

export const TOPIC_TAG_SET = new Set<string>(TOPIC_TAG_NAMES);
export const CANONICAL_TAG_SET = new Set<string>(CANONICAL_TAG_NAMES);

export function isTopicTag(tag: string): tag is TopicTag {
  return TOPIC_TAG_SET.has(tag);
}

export function isCanonicalTag(tag: string): boolean {
  return CANONICAL_TAG_SET.has(tag);
}

export function getTopicTag(tag: string) {
  return TOPIC_TAGS.find((topic) => topic.tag === tag);
}

export function getStandardTagMetadata(tag: string) {
  return STANDARD_TAG_METADATA.find((meta) => meta.tag === tag);
}

export function compareTags(a: string, b: string): number {
  const ai = CANONICAL_TAG_NAMES.indexOf(a);
  const bi = CANONICAL_TAG_NAMES.indexOf(b);

  if (ai >= 0 && bi >= 0) return ai - bi;
  if (ai >= 0) return -1;
  if (bi >= 0) return 1;

  return a.localeCompare(b, 'ko');
}
