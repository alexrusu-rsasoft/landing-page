import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-about',
  imports: [TranslocoPipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutSection {
  readonly languages = [
    { nameKey: 'german', levelKey: 'fluent' },
    { nameKey: 'english', levelKey: 'fluent' },
    { nameKey: 'romanian', levelKey: 'native' },
    { nameKey: 'italian', levelKey: 'basic' },
  ];
}
