import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-accessibility',
  imports: [TranslocoPipe],
  templateUrl: './accessibility.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Accessibility {}
