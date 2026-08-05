import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Certification {
  name: string;
  issuer: string;
  year: string;
  icon: string;
  imageUrl: string;
  credentialUrl?: string;
}

@Component({
  selector: 'app-certifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certifications.html',
  styleUrl: './certifications.css',
})
export class Certifications {
  readonly certifications: Certification[] = [
    {
      name: 'Senior Angular Developer',
      issuer: 'certificates.dev',
      year: '2026',
      icon: 'verified_user',
      imageUrl:
        'https://certificates.dev/.netlify/images?url=https:%2F%2Fapi.certificates.dev%2Fcertificates%2Fthumbnail%2Fa12fa0a8-6382-4e88-af67-646b056e7faf.jpg',
      credentialUrl:
        'https://certificates.dev/certificates/a12fa0a8-6382-4e88-af67-646b056e7faf/share',
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

  readonly activeCert = signal<Certification | null>(null);
  readonly modalPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  showCert(cert: Certification, event: MouseEvent | FocusEvent): void {
    const card = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.modalPosition.set({
      x: card.left + card.width / 2,
      y: card.top,
    });
    this.activeCert.set(cert);
  }

  hideCert(): void {
    this.activeCert.set(null);
  }
}
