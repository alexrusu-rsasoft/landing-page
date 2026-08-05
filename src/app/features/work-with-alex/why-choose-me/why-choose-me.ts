import { Component, computed, inject } from '@angular/core';
import { ExperienceService } from '../experience';
import { Certifications } from '../certifications/certifications';

@Component({
  selector: 'app-why-choose-me',
  imports: [Certifications],
  templateUrl: './why-choose-me.html',
  styleUrl: './why-choose-me.css',
})
export class WhyChooseMe {
  readonly #service = inject(ExperienceService);
  readonly isLoading = this.#service.isLoading;
  readonly yearsOfExperience = this.#service.experienceInYears;
  readonly numberOfProjects = this.#service.numberOfProjects;
  readonly numberOfClients = computed(() => this.#service.experiences()?.length || 0);
}
