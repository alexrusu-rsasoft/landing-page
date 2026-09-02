import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SKILL_CATEGORIES } from '../profile-data';

@Component({
  selector: 'app-skills',
  imports: [TranslocoPipe],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsSection {
  readonly categories = SKILL_CATEGORIES;

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
