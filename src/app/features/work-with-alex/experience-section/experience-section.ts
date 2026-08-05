import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ExperienceService } from '../experience';

@Component({
  selector: 'app-experience',
  templateUrl: './experience-section.html',
  styleUrls: ['./experience-section.css'],
  imports: [DatePipe],
})
export class ExperienceSection {
  readonly #service = inject(ExperienceService);
  readonly experiences = this.#service.experiences;
  readonly isLoading = this.#service.isLoading;
}
