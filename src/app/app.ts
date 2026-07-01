import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    // Angular's anchorScrolling ignores CSS scroll-padding-top / scroll-margin-top.
    // ViewportScroller.setOffset is the correct way to reserve space for the sticky nav.
    inject(ViewportScroller).setOffset([0, 80]);
  }
}
