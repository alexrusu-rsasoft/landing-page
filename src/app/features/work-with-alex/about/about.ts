import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LANGUAGES } from '../profile-data';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { HumanBehind } from '../human-behind/human-behind';

@Component({
  selector: 'app-about',
  imports: [TranslocoPipe, RevealOnScrollDirective, HumanBehind],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  readonly languages = LANGUAGES;
}
