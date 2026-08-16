import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService } from '../../../../core/analytics.service';
import { AVAILABILITY_OPTIONS, COLLABORATION_OPTIONS } from '../apply-options';
import { CareersApplyApi } from '../careers-apply-api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMMEDIATE_AVAILABILITY = AVAILABILITY_OPTIONS[0].value;

// Verbatim from the Google Form's own "Candidate Privacy Notice" question,
// kept in English (its original language) rather than machine-retranslated,
// since altering the wording of a GDPR consent notice isn't ours to do.
const PRIVACY_NOTICE_HTML = `
<p><strong>Candidate Privacy Notice (GDPR Compliant)</strong><br>
Data Controller: RSA SOFT (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)<br>
Contact Information: alex.rusu@rsasoft.ro<br>
As part of our recruitment process, RSA SOFT collects and processes personal data relating to job applicants. We are committed to being transparent about how we collect and use that data and to meeting our data protection obligations under the General Data Protection Regulation (GDPR).</p>
<p><strong>1. What Information Do We Collect?</strong><br>
We may collect, store, and use a variety of information about you, including:</p>
<ul>
<li>Your name, address, and contact details (email address and phone number).</li>
<li>Details of your qualifications, skills, experience, and employment history.</li>
<li>Information from interviews and any assessments or screening tests conducted during the recruitment process.</li>
<li>Information about your current level of remuneration, including benefit entitlements.</li>
<li>(If applicable) Information about your entitlement to work in Romania.</li>
</ul>
<p><strong>2. Why Do We Process Personal Data? (Legal Basis)</strong><br>
We need to process your data to take steps at your request prior to entering into a contract with you. We also need to process your data to ensure we are complying with our legal obligations (e.g., checking a successful applicant's right to work).<br>
RSA SOFT has a legitimate interest in processing personal data during the recruitment process. Processing data from job applicants allows us to manage the recruitment process, assess and confirm a candidate's suitability for employment, and decide to whom to offer a job.</p>
<p><strong>3. Screening and Automated Decision-Making</strong><br>
As part of our initial screening process, we may analyze the information you provide to assess your suitability for the role against the job requirements.</p>
<p><strong>4. Who Has Access to Your Data?</strong><br>
Your information will be shared internally for the purposes of the recruitment exercise. This includes members of the HR and recruitment team, interviewers involved in the recruitment process, and managers in the business area with a vacancy.<br>
RSA SOFT will not share your data with third parties unless your application for employment is successful and we make you an offer of employment, or if we use a third-party screening platform that acts as our Data Processor (under strict confidentiality agreements).</p>
<p><strong>5. How Long Do We Keep Your Data?</strong></p>
<ul>
<li><strong>If your application is unsuccessful:</strong> RSA SOFT will hold your personal data on file permanently, to provide you with other opportunities as they arise.</li>
<li><strong>If your application is successful:</strong> Personal data gathered during the recruitment process will be transferred to your personnel file and retained during your employment.</li>
</ul>
<p><strong>6. Your Rights</strong><br>
As a data subject, you have a number of rights under the GDPR. You can:</p>
<ul>
<li>Access and obtain a copy of your data on request.</li>
<li>Require us to change incorrect or incomplete data.</li>
<li>Require us to delete or stop processing your data (e.g., where the data is no longer necessary for the purposes of processing).</li>
<li>Object to the processing of your data where we are relying on legitimate interests as the legal ground for processing.</li>
</ul>
<p>If you wish to exercise any of these rights, or if you have any questions about how RSA SOFT handles your data, please contact us at alex.rusu@rsasoft.ro. You also have the right to lodge a complaint with your local Data Protection Authority.</p>
`;

@Component({
  selector: 'app-careers-apply-form',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './careers-apply-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersApplyForm implements OnInit {
  readonly initialTargetRole = input<string>('');
  readonly closed = output<void>();

  readonly #api = inject(CareersApplyApi);
  readonly #analytics = inject(AnalyticsService);

  protected readonly availabilityOptions = AVAILABILITY_OPTIONS;
  protected readonly collaborationOptions = COLLABORATION_OPTIONS;
  protected readonly privacyNoticeHtml = PRIVACY_NOTICE_HTML;

  protected readonly fullName = signal('');
  protected readonly phone = signal('');
  protected readonly email = signal('');
  protected readonly availability = signal('');
  protected readonly noticeEndDate = signal('');
  protected readonly targetRole = signal('');
  protected readonly techStack = signal('');
  protected readonly yearsExperience = signal('');
  protected readonly languages = signal('');
  protected readonly collaborationType = signal('');
  protected readonly expectedRate = signal('');
  protected readonly consent = signal(false);
  /** Honeypot: hidden from real visitors, only bots that autofill every field populate it. */
  protected readonly website = signal('');

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showErrors = signal(false);
  protected readonly showPrivacyNotice = signal(false);

  ngOnInit(): void {
    this.targetRole.set(this.initialTargetRole());
  }

  protected showsNoticeDate(): boolean {
    const value = this.availability();
    return !!value && value !== IMMEDIATE_AVAILABILITY;
  }

  protected togglePrivacyNotice(): void {
    this.showPrivacyNotice.set(!this.showPrivacyNotice());
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected onSubmit(): void {
    if (this.website().trim()) {
      // Bot tripped the honeypot: show success without submitting or tracking.
      this.submitted.set(true);
      return;
    }

    if (!this.isValid()) {
      this.showErrors.set(true);
      return;
    }

    this.showErrors.set(false);
    this.submitting.set(true);

    this.#api
      .submitApplication({
        fullName: this.fullName().trim(),
        phone: this.phone().trim(),
        email: this.email().trim(),
        availability: this.availability(),
        noticeEndDate: this.showsNoticeDate() ? this.noticeEndDate() : undefined,
        targetRole: this.targetRole().trim(),
        techStack: this.techStack().trim(),
        yearsExperience: this.yearsExperience().trim(),
        languages: this.languages().trim(),
        collaborationType: this.collaborationType() || undefined,
        expectedRate: this.expectedRate().trim(),
      })
      .subscribe({
        next: () => this.handleSubmitted(),
        error: () => this.handleSubmitted(),
      });
  }

  private isValid(): boolean {
    return (
      !!this.fullName().trim() &&
      !!this.phone().trim() &&
      EMAIL_PATTERN.test(this.email().trim()) &&
      !!this.availability() &&
      !!this.targetRole().trim() &&
      !!this.techStack().trim() &&
      !!this.yearsExperience().trim() &&
      !!this.languages().trim() &&
      !!this.expectedRate().trim() &&
      this.consent()
    );
  }

  private handleSubmitted(): void {
    this.submitting.set(false);
    this.submitted.set(true);
    this.#analytics.trackCareersApplicationSubmit(this.targetRole());
  }
}
