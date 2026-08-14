import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ExperienceService } from '../experience';

@Component({
  selector: 'app-hero',
  imports: [TranslocoPipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly #service = inject(ExperienceService);
  readonly yearsOfExperience = this.#service.experienceInYears;
  readonly isLoading = this.#service.isLoading;
}
