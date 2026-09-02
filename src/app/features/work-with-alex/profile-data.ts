export interface Skill {
  name: string;
  level: string;
}
export interface SkillCategory {
  titleKey: string;
  icon: string;
  skills: Skill[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    titleKey: 'frontend',
    icon: 'code',
    skills: [
      { name: 'Angular (4–20)', level: 'expert' },
      { name: 'TypeScript', level: 'expert' },
      { name: 'RxJS', level: 'expert' },
      { name: 'NgRx / Signals', level: 'expert' },
      { name: 'HTML / SCSS', level: 'expert' },
      { name: 'JavaScript', level: 'expert' },
      { name: 'Angular Material', level: 'expert' },
      { name: 'PrimeNG', level: 'advanced' },
      { name: 'Storybook', level: 'advanced' },
    ],
  },
  {
    titleKey: 'backend',
    icon: 'server',
    skills: [
      { name: 'NestJS', level: 'advanced' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'Python / Flask', level: 'intermediate' },
      { name: 'FastAPI', level: 'intermediate' },
      { name: 'Express / Koa', level: 'intermediate' },
    ],
  },
  {
    titleKey: 'databases',
    icon: 'database',
    skills: [
      { name: 'MongoDB', level: 'advanced' },
      { name: 'PostgreSQL', level: 'advanced' },
      { name: 'MySQL', level: 'intermediate' },
      { name: 'Redis', level: 'intermediate' },
    ],
  },
  {
    titleKey: 'cloudDevops',
    icon: 'cloud',
    skills: [
      { name: 'AWS', level: 'intermediate' },
      { name: 'Heroku', level: 'advanced' },
      { name: 'Render', level: 'advanced' },
      { name: 'Docker', level: 'intermediate' },
      { name: 'GitLab CI', level: 'advanced' },
      { name: 'Nx Monorepo', level: 'advanced' },
    ],
  },
  {
    titleKey: 'leadership',
    icon: 'leadership',
    skills: [
      { name: 'Scrum / Kanban', level: 'expert' },
      { name: 'Product Management', level: 'advanced' },
      { name: 'Team Mentoring', level: 'expert' },
      { name: 'Stakeholder Management', level: 'advanced' },
      { name: 'Technical Interviews', level: 'expert' },
    ],
  },
  {
    titleKey: 'tools',
    icon: 'tools',
    skills: [
      { name: 'Git / GitHub / GitLab', level: 'expert' },
      { name: 'Jira / Confluence', level: 'expert' },
      { name: 'SonarQube', level: 'advanced' },
      { name: 'Jest / Cypress', level: 'advanced' },
      { name: 'Figma', level: 'intermediate' },
    ],
  },
];

export interface Education {
  degree: string;
  school: string;
  period: string;
  icon?: string;
}
export interface Certification {
  name: string;
  year: string;
}
export interface Organization {
  name: string;
  period: string;
}

export const EDUCATION: Education[] = [
  {
    degree: 'Master in Advanced Informatics Systems',
    school: 'Babeș-Bolyai University of Cluj-Napoca',
    period: '2019 – 2021',
    icon: 'school',
  },
  {
    degree: 'Bachelor in Computer Science with German',
    school: 'Babeș-Bolyai University of Cluj-Napoca',
    period: 'Graduated in 2019',
    icon: 'school',
  },
];

export const CERTIFICATIONS: Certification[] = [
  { name: 'Senior Angular Developer', year: '2026' },
  { name: 'Mid Angular Developer', year: '2026' },
  { name: 'AWS Certified Cloud Practitioner', year: '2025' },
  { name: 'Public Speaking – John Maxwell Team', year: '2017' },
  { name: 'Cybersecurity – Penetration Testing', year: '2017' },
];

export const ORGANIZATIONS: Organization[] = [
  { name: 'German Line Student Representative – UBB', period: '2016–2021' },
  { name: 'Member & Founder – Interact Zalau', period: '2015' },
];

export interface LanguageProficiency {
  nameKey: string;
  levelKey: string;
}

export const LANGUAGES: LanguageProficiency[] = [
  { nameKey: 'german', levelKey: 'fluent' },
  { nameKey: 'english', levelKey: 'fluent' },
  { nameKey: 'romanian', levelKey: 'native' },
  { nameKey: 'italian', levelKey: 'basic' },
];
