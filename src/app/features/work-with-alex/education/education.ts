import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CERTIFICATIONS, EDUCATION, ORGANIZATIONS } from '../profile-data';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';

@Component({
  selector: 'app-education',
  imports: [TranslocoPipe, RevealOnScrollDirective],
  templateUrl: './education.html',
  styleUrl: './education.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationSection {
  readonly education = EDUCATION;
  readonly certifications = CERTIFICATIONS;
  readonly organizations = ORGANIZATIONS;
}
