import { ExperienceItem } from './experience-item';

export const EXPERIENCES: ExperienceItem[] = [
  {
    title: 'Founder & Lead Angular Developer',
    company: 'RSASoft',
    period: {
      start: new Date('2021-03-01'),
    },
    current: true,
    description:
      'Founded and led the company, managing 5 key customers and delivering tailored software solutions. Blending technical leadership with business management.',
    highlights: [
      'Led migrations to Angular 16–20 with standalone components & NgRx-SignalStore',
      'Built full-stack reporting app automating accounting & invoicing (Angular 17 + NestJS)',
      'Optimized RxJS pipelines for improved data processing efficiency',
      'Deployed Angular on Render, NestJS + DB on Heroku',
      'Managed end-to-end operations: sales, client interactions, project delivery',
    ],
    projects: ['Archimedes'],
    tech: [
      'Angular 15-20',
      'NgRx-SignalStore',
      'RxJS',
      'NestJS',
      'MongoDB Atlas',
      'PostgreSQL',
      'Jest',
      'Heroku',
      'Render',
    ],
    client: false,
  },
  {
    title: 'Lead Angular Developer',
    company: 'SKIY28 GmbH',
    period: {
      start: new Date('2023-02-01'),
      end: new Date('2025-12-28'),
    },
    current: true,
    description:
      'Spearheaded development of a vulnerability securities management web app using Porsche Design System and agile practices.',
    highlights: [
      'Led entire frontend using Angular 16 & Porsche Design System',
      'Directed migration from VanillaJS → Angular 15 → 16 → 17 → 18 → 19 → 20',
      'Integrated SAML Authentication & NgRx Store for state management',
      'Developed lazy-loaded components for optimized performance',
      'Mentored junior developers in agile team of 6 using Scrum',
    ],
    projects: ['MHP - Porsche'],
    tech: [
      'Angular 16-20',
      'NgRx Store',
      'Signals',
      'RxJS',
      'Python Flask/FastAPI',
      'SonarQube',
      'AWS',
    ],
    client: true,
  },
  {
    title: 'Senior Angular Developer',
    company: 'Faptic Technology',
    period: {
      start: new Date('2024-11-01'),
      end: new Date('2025-05-28'),
    },
    description:
      'Developed a highly scalable trading app for a key retail trading company (TradingPoint/XM).',
    highlights: [
      'Implemented customizable standalone components with Storybook + Ionic PWA',
      'Interviewed 50+ candidates for Angular developer roles',
      'Improved monorepo scalability with team of 10 Angular developers',
    ],
    projects: ['XM - TradingPoint'],
    tech: ['Angular 19', 'NgRx Signals', 'Ionic', 'Capacitor', 'PWA', 'Nx Monorepo', 'Storybook'],
    client: false,
  },
  {
    title: 'Senior Angular Developer',
    company: 'SHE Informationstechnologie AG',
    period: {
      start: new Date('2022-05-01'),
      end: new Date('2024-06-28'),
    },
    description:
      'Contributed to a major software solution for German companies communicating with fiscal authorities.',
    highlights: [
      'Migrated application from Angular 15 to 16 with stability & breaking change management',
      'Led transition to full PrimeNG solutions, upgrading legacy components',
      'Enhanced code quality through reviews, linting & unit testing',
    ],
    projects: ['Agenda'],
    tech: ['Angular 16', 'PrimeNG', 'NgXs Store', 'Docker', 'Java', 'Elasticsearch'],
    client: true,
  },
  {
    title: 'Senior Angular Developer',
    company: 'Accesa Raro Romania',
    period: {
      start: new Date('2022-05-01'),
      end: new Date('2023-01-28'),
    },
    description:
      'Worked on a fintech solution enabling banks to offer financial products with custom theming.',
    highlights: [
      'Implemented generic solutions with custom theming for multiple banks',
      'Maintained 80% test coverage with Jest and Cypress',
    ],
    projects: ['Atruvia'],
    tech: ['Angular', 'Angular Material', 'Jest', 'Cypress', 'Bootstrap'],
    client: true,
  },
  {
    title: 'Product Manager',
    company: 'Deutsche Fintech Solutions',
    period: {
      start: new Date('2021-06-01'),
      end: new Date('2022-05-28'),
    },
    description:
      "Managed agile team of 19 building a financial advisory tool's accounting module for DVAG.",
    highlights: [
      'Led development of customer wills & income/expenses components',
      'Navigated stakeholder relationships and negotiated technical solutions',
      'Acted as liaison between product and technical teams',
    ],
    projects: ['DVAG'],
    tech: ['GitLab CI', 'Jira', 'Confluence', 'Figma', 'Waydev'],
    client: true,
  },
  {
    title: 'Angular Developer',
    company: 'Alighieri',
    period: {
      start: new Date('2021-03-01'),
      end: new Date('2021-09-28'),
    },
    description:
      'Developed a sales flow application for Germany’s largest private tire service provider to upsell various tire packages. Key Responsibilities and Achievements:',
    highlights: [
      'Managed state across 5 pages of the sales flow, implementing various selling propositions.',
      'Designed and adapted different views based on customer requests to enhance user experience and meet specific needs.',
    ],
    projects: ['Emil Frey'],
    tech: [
      'Angular 9',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'SQL Server',
      '.NET Core',
      'HTML',
      'CSS',
      'Git',
    ],
    client: true,
  },
  {
    title: 'Full Stack Developer',
    company: 'Porsche Engineering',
    period: {
      start: new Date('2019-10-01'),
      end: new Date('2020-06-28'),
    },
    description: 'Worked on various projects for the Infotainment System of the Porsche Taycan.',
    highlights: [
      'Implemented video streaming app for Infotainment System',
      'Adapted insurance selling app for the Infotainment System',
      'Developed games as part of the innovation team',
    ],
    projects: ['Porsche'],
    tech: ['Angular', 'Node.js', 'KOA', 'KOA Websockets', 'Redis'],
    client: false,
  },
  {
    title: 'BI Consultant – Angular & Qlik, SAP',
    company: 'MHP – A Porsche Company',
    period: {
      start: new Date('2017-07-01'),
      end: new Date('2019-07-28'),
    },
    description:
      'Worked on various projects for HR and BI departments across Daimler AG, KUKA AG, and Porsche.',
    highlights: [
      'Built skill management tool for HR employee assessment',
      'Adapted HR frontend app from Daimler AG for KPI tracking',
      'Built new frontend app for KUKA AG BI department',
    ],
    projects: ['Internship', 'Daimler', 'Porsche', 'Kuka'],
    tech: ['Angular', 'Qlik Sense', 'SAP Lumira', 'SAP BW', 'SAP ABAP', 'SAP UI5'],
    client: false,
  },
];
