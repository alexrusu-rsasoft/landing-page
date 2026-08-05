import { Component } from '@angular/core';

interface Skill {
  name: string;
  level: string;
}
interface Category {
  title: string;
  icon: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class SkillsSection {
  readonly categories: Category[] = [
    {
      title: 'Frontend',
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
      title: 'Backend',
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
      title: 'Databases',
      icon: 'database',
      skills: [
        { name: 'MongoDB', level: 'advanced' },
        { name: 'PostgreSQL', level: 'advanced' },
        { name: 'MySQL', level: 'intermediate' },
        { name: 'Redis', level: 'intermediate' },
      ],
    },
    {
      title: 'Cloud & DevOps',
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
      title: 'Leadership',
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
      title: 'Tools',
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

  getLevelWidth(level: string) {
    return level === 'expert' ? 'w-full' : level === 'advanced' ? 'w-3/4' : 'w-1/2';
  }

  getLevelColor(level: string) {
    return level === 'expert'
      ? 'bg-primary'
      : level === 'advanced'
        ? 'bg-slate-600'
        : 'bg-slate-400';
  }
}
