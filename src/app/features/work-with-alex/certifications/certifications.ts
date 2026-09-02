import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';

interface Certification {
  name: string;
  issuer: string;
  year: string;
  icon: string;
  imageUrl: string;
  credentialUrl?: string;
}

// Prefer directly above the card; flip below when there isn't room (e.g. the
// card is near the top of the viewport).
const PREVIEW_POSITIONS: ConnectedPosition[] = [
  { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 },
  { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
];

@Component({
  selector: 'app-certifications',
  imports: [TranslocoPipe, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certifications.html',
  styleUrl: './certifications.css',
})
export class Certifications implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  @ViewChild('certPreview') private certPreviewTemplate!: TemplateRef<{ $implicit: Certification }>;

  private overlayRef: OverlayRef | null = null;

  readonly certifications: Certification[] = [
    {
      name: 'Senior Angular Developer',
      issuer: 'certificates.dev',
      year: '2026',
      icon: 'verified_user',
      imageUrl:
        'https://certificates.dev/.netlify/images?url=https:%2F%2Fapi.certificates.dev%2Fcertificates%2Fthumbnail%2Fa12fa0a8-6382-4e88-af67-646b056e7faf.jpg',
      credentialUrl:
        'https://certificates.dev/angular/certificates/a12fa0a8-6382-4e88-af67-646b056e7faf',
    },
    // {
    //   name: 'Medium Angular Developer',
    //   issuer: 'certificates.dev',
    //   year: '2026',
    //   icon: 'verified_user',
    //   imageUrl:
    //     'https://certificates.dev/.netlify/images?url=https:%2F%2Fapi.certificates.dev%2Fcertificates%2Fthumbnail%2Fa0f12c3a-ef04-47b2-9f53-88e4ff1d22b5.jpg',
    //   credentialUrl:
    //     'https://certificates.dev/certificates/a0f12c3a-ef04-47b2-9f53-88e4ff1d22b5/share',
    // },
    {
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      year: '2025',
      icon: 'cloud',
      imageUrl:
        'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png',
      credentialUrl: 'https://www.credly.com/badges/a265ffef-9145-486b-8c2b-736bb2d0c930',
    },
  ];

  constructor() {
    afterNextRender(() => {
      for (const cert of this.certifications) {
        const link = this.document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = cert.imageUrl;
        this.document.head.appendChild(link);
      }
    });
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  showCert(cert: Certification, event: MouseEvent | FocusEvent): void {
    const card = event.currentTarget as HTMLElement;
    this.hideCert();

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(card)
        .withPositions(PREVIEW_POSITIONS)
        .withViewportMargin(12)
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'cert-overlay-panel',
    });

    const portal = new TemplatePortal(this.certPreviewTemplate, this.viewContainerRef, {
      $implicit: cert,
    });
    this.overlayRef.attach(portal);
  }

  hideCert(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  /**
   * mouseenter/mouseleave don't fire reliably through Angular's production
   * event-dispatch (it delegates them via bubbling mouseover/mouseout), so
   * this reimplements enter/leave semantics on top of mouseover/mouseout
   * directly, which does fire reliably.
   */
  onCardPointerEnter(cert: Certification, event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const from = event.relatedTarget;
    if (from instanceof Node && card.contains(from)) return;
    this.showCert(cert, event);
  }

  onCardPointerLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    const to = event.relatedTarget;
    if (to instanceof Node && card.contains(to)) return;
    this.hideCert();
  }
}
