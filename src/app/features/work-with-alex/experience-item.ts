export interface ExperienceItem {
  title: string;
  company: string;
  start: Date;
  end?: Date;
  description: string;
  highlights: string[];
  tech: string[];
  projects: string[];
  current?: boolean;
  client: boolean;
}
