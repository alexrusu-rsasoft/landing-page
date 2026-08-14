import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Hero } from './hero/hero';
import { ExperienceSection } from './experience-section/experience-section';
import { AboutSection } from './about/about';
import { SkillsSection } from './skills/skills';
import { EducationSection } from './education/education';
import { WhyChooseMe } from './why-choose-me/why-choose-me';

@Component({
  selector: 'app-work-with-alex',
  templateUrl: './work-with-alex.html',
  styleUrl: './work-with-alex.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Hero,
    ExperienceSection,
    AboutSection,
    SkillsSection,
    EducationSection,
    WhyChooseMe,
    TranslocoPipe,
  ],
})
export class WorkWithAlex {}
