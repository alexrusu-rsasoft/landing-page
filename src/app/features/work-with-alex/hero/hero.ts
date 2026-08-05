import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExperienceService } from '../experience';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly #service = inject(ExperienceService);
  readonly yearsOfExperience = this.#service.experienceInYears;
}
