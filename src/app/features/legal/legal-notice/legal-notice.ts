import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-legal-notice',
  imports: [TranslocoPipe],
  templateUrl: './legal-notice.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalNotice {}
