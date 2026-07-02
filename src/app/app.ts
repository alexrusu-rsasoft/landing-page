import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Layout } from './core/layout/layout';

@Component({
  selector: 'app-root',
  imports: [Layout],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    // Angular's anchorScrolling ignores CSS scroll-padding-top / scroll-margin-top.
    // ViewportScroller.setOffset is the correct way to reserve space for the sticky nav.
    inject(ViewportScroller).setOffset([0, 80]);
  }
}
