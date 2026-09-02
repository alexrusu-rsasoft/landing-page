import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LANGUAGES } from '../profile-data';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-about',
  imports: [TranslocoPipe, RevealOnScrollDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  readonly languages = LANGUAGES;
}
