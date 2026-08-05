import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutSection {
  readonly languages = [
    { name: 'German', level: 'Fluent' },
    { name: 'English', level: 'Fluent' },
    { name: 'Romanian', level: 'Native' },
    { name: 'Italian', level: 'Basic' },
  ];
}
