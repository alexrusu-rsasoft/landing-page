import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-terms',
  imports: [TranslocoPipe],
  templateUrl: './terms.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Terms {}
