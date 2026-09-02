import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributionService } from './attribution.service';

/**
 * Handles /via/:channel short links used wherever the destination can't
 * carry a query string (e.g. LinkedIn strips UTM params from links placed
 * in its "Featured" section, but leaves a plain path alone). Attributes the
 * visit to the named channel, then sends the visitor on to the homepage.
 */
@Component({
  selector: 'app-via-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class ViaRedirect implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly attribution = inject(AttributionService);

  ngOnInit(): void {
    const channel = this.route.snapshot.paramMap.get('channel');
    if (channel) this.attribution.setChannel(channel);
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
