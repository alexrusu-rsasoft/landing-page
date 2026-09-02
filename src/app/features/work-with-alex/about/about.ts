import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LANGUAGES } from '../profile-data';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';

interface HumanBehindPhoto {
  readonly id: number;
  /** Filled in once the real photo is picked; null renders a placeholder slot. */
  readonly src: string | null;
  readonly tiltClass: string;
}

/** Slight alternating tilt gives the strip a candid, "polaroid" feel rather than a rigid grid. */
const HUMAN_BEHIND_PHOTOS: readonly HumanBehindPhoto[] = [
  { id: 1, src: null, tiltClass: 'rotate-[-3deg]' },
  { id: 2, src: null, tiltClass: 'rotate-[2deg]' },
  { id: 3, src: null, tiltClass: 'rotate-[-2deg]' },
  { id: 4, src: null, tiltClass: 'rotate-[3deg]' },
];

@Component({
  selector: 'app-about',
  imports: [TranslocoPipe, RevealOnScrollDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  readonly languages = LANGUAGES;
  readonly humanBehindPhotos = HUMAN_BEHIND_PHOTOS;
}
