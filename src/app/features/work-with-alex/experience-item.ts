export interface ExperienceItem {
  title: string;
  company: string;
  period: Period;
  description: string;
  highlights: string[];
  tech: string[];
  projects: string[];
  current?: boolean;
}

interface Period {
  start: Date;
  end?: Date;
}
