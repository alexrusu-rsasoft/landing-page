import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CERTIFICATIONS, EDUCATION, ORGANIZATIONS } from '../profile-data';

@Component({
  selector: 'app-education',
  imports: [TranslocoPipe],
  templateUrl: './education.html',
  styleUrl: './education.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationSection {
  readonly education = EDUCATION;
  readonly certifications = CERTIFICATIONS;
  readonly organizations = ORGANIZATIONS;
}
