import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsService } from '../../../../core/analytics.service';
import { AVAILABILITY_OPTIONS, COLLABORATION_OPTIONS } from '../apply-options';
import { CareersApplyApi } from '../careers-apply-api';
import { DEFAULT_LANGUAGE_LEVEL, LANGUAGE_LEVELS, LANGUAGE_OPTIONS } from '../language-options';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Allows spaces, dashes, parentheses and an optional leading "+", but the
// digit count (7-15) is what actually decides validity, per E.164.
const PHONE_CHAR_PATTERN = /^\+?[\d\s()-]+$/;
const IMMEDIATE_AVAILABILITY = AVAILABILITY_OPTIONS[0].value;
const CUSTOM_LANGUAGE_PREFIX = 'custom:';

type StepId = 'contact' | 'availability' | 'role' | 'languages' | 'consent';

interface StepMeta {
  id: StepId;
  emoji: string;
  titleKey: string;
}

interface SelectedLanguage {
  code: string;
  level: string;
}

const STEPS: readonly StepMeta[] = [
  { id: 'contact', emoji: '👋', titleKey: 'careers.apply.stepContactTitle' },
  { id: 'availability', emoji: '⏰', titleKey: 'careers.apply.stepAvailabilityTitle' },
  { id: 'role', emoji: '💼', titleKey: 'careers.apply.stepRoleTitle' },
  { id: 'languages', emoji: '🌍', titleKey: 'careers.apply.stepLanguagesTitle' },
  { id: 'consent', emoji: '🎉', titleKey: 'careers.apply.stepConsentTitle' },
];

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
  styleUrl: './careers-apply-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersApplyForm implements OnInit, OnDestroy {
  readonly initialTargetRole = input<string>('');
  readonly closed = output<void>();

  readonly #api = inject(CareersApplyApi);
  readonly #analytics = inject(AnalyticsService);
  readonly #transloco = inject(TranslocoService);

  protected readonly steps = STEPS;
  protected readonly availabilityOptions = AVAILABILITY_OPTIONS;
  protected readonly collaborationOptions = COLLABORATION_OPTIONS;
  protected readonly languageOptions = LANGUAGE_OPTIONS;
  protected readonly languageLevels = LANGUAGE_LEVELS;
  protected readonly privacyNoticeHtml = PRIVACY_NOTICE_HTML;

  protected readonly currentStepIndex = signal(0);
  protected readonly furthestStepIndex = signal(0);
  protected readonly attemptedNext = signal(false);

  /** Locked when applying from a specific role's card; free-text when sending a general profile. */
  protected readonly isSpecificRole = computed(() => !!this.initialTargetRole().trim());

  protected readonly currentStep = computed(() => this.steps[this.currentStepIndex()]);
  protected readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  protected readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  protected readonly progressPercent = computed(
    () => ((this.currentStepIndex() + 1) / this.steps.length) * 100,
  );

  protected readonly fullName = signal('');
  protected readonly phone = signal('');
  protected readonly email = signal('');
  protected readonly availability = signal('');
  protected readonly noticeEndDate = signal('');
  protected readonly targetRole = signal('');
  protected readonly techStack = signal('');
  protected readonly yearsExperience = signal('');
  protected readonly expectedRate = signal('');
  protected readonly collaborationType = signal('');
  protected readonly consent = signal(false);
  /** Honeypot: hidden from real visitors, only bots that autofill every field populate it. */
  protected readonly website = signal('');

  protected readonly selectedLanguages = signal<SelectedLanguage[]>([]);
  protected readonly customLanguageInput = signal('');
  protected readonly showCustomLanguageInput = signal(false);

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPrivacyNotice = signal(false);

  protected readonly phoneTouched = signal(false);
  protected readonly emailTouched = signal(false);
  protected readonly showPhoneError = computed(
    () => (this.phoneTouched() || this.attemptedNext()) && !this.isPhoneValid(),
  );
  protected readonly showEmailError = computed(
    () => (this.emailTouched() || this.attemptedNext()) && !this.isEmailValid(),
  );

  protected readonly stepValid = computed(() => {
    switch (this.currentStep().id) {
      case 'contact':
        return !!this.fullName().trim() && this.isPhoneValid() && this.isEmailValid();
      case 'availability':
        return !!this.availability();
      case 'role':
        return (
          !!this.targetRole().trim() &&
          !!this.techStack().trim() &&
          !!this.yearsExperience().trim() &&
          !!this.expectedRate().trim()
        );
      case 'languages':
        return this.selectedLanguages().length > 0;
      case 'consent':
        return this.consent();
      default:
        return true;
    }
  });

  ngOnInit(): void {
    this.targetRole.set(this.initialTargetRole());
    // This component only ever exists in the DOM while its modal is open,
    // so init/destroy is the modal's own open/close lifecycle.
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected isPhoneValid(): boolean {
    const value = this.phone().trim();
    if (!value || !PHONE_CHAR_PATTERN.test(value)) return false;
    const digitCount = value.replace(/\D/g, '').length;
    return digitCount >= 7 && digitCount <= 15;
  }

  protected isEmailValid(): boolean {
    return EMAIL_PATTERN.test(this.email().trim());
  }

  /** Strips anything that isn't a digit, +, space, dash or parenthesis as the user types. */
  protected onPhoneInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const sanitized = inputEl.value.replace(/[^\d+()\s-]/g, '');
    if (inputEl.value !== sanitized) {
      inputEl.value = sanitized;
    }
    this.phone.set(sanitized);
  }

  protected showsNoticeDate(): boolean {
    const value = this.availability();
    return !!value && value !== IMMEDIATE_AVAILABILITY;
  }

  protected isLanguageSelected(code: string): boolean {
    return this.selectedLanguages().some((l) => l.code === code);
  }

  protected languageLevel(code: string): string | undefined {
    return this.selectedLanguages().find((l) => l.code === code)?.level;
  }

  protected toggleLanguage(code: string): void {
    const current = this.selectedLanguages();
    if (current.some((l) => l.code === code)) {
      this.selectedLanguages.set(current.filter((l) => l.code !== code));
    } else {
      this.selectedLanguages.set([...current, { code, level: DEFAULT_LANGUAGE_LEVEL }]);
    }
  }

  protected setLanguageLevel(code: string, level: string): void {
    this.selectedLanguages.update((list) => list.map((l) => (l.code === code ? { ...l, level } : l)));
  }

  protected removeLanguage(code: string): void {
    this.selectedLanguages.update((list) => list.filter((l) => l.code !== code));
  }

  protected addCustomLanguage(): void {
    const name = this.customLanguageInput().trim();
    if (!name) return;
    const code = `${CUSTOM_LANGUAGE_PREFIX}${name}`;
    if (!this.selectedLanguages().some((l) => l.code === code)) {
      this.selectedLanguages.set([
        ...this.selectedLanguages(),
        { code, level: DEFAULT_LANGUAGE_LEVEL },
      ]);
    }
    this.customLanguageInput.set('');
    this.showCustomLanguageInput.set(false);
  }

  protected languageFlag(code: string): string {
    return code.startsWith(CUSTOM_LANGUAGE_PREFIX)
      ? '🌐'
      : (LANGUAGE_OPTIONS.find((l) => l.code === code)?.flag ?? '🌐');
  }

  protected languageDisplayName(code: string): string {
    if (code.startsWith(CUSTOM_LANGUAGE_PREFIX)) return code.slice(CUSTOM_LANGUAGE_PREFIX.length);
    const option = LANGUAGE_OPTIONS.find((l) => l.code === code);
    return option ? this.#transloco.translate(option.labelKey) : code;
  }

  protected levelLabel(level: string): string {
    return level === 'Native' ? this.#transloco.translate('careers.apply.levelNative') : level;
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

  protected next(): void {
    if (this.website().trim()) {
      // Bot tripped the honeypot: skip straight to a fake success.
      this.submitted.set(true);
      return;
    }

    if (!this.stepValid()) {
      this.attemptedNext.set(true);
      return;
    }

    this.attemptedNext.set(false);

    if (this.isLastStep()) {
      this.onSubmit();
      return;
    }

    const nextIndex = this.currentStepIndex() + 1;
    this.currentStepIndex.set(nextIndex);
    this.furthestStepIndex.update((current) => Math.max(current, nextIndex));
  }

  protected back(): void {
    this.attemptedNext.set(false);
    this.currentStepIndex.update((current) => Math.max(0, current - 1));
  }

  protected goToStep(index: number): void {
    if (index <= this.furthestStepIndex()) {
      this.attemptedNext.set(false);
      this.currentStepIndex.set(index);
    }
  }

  private onSubmit(): void {
    if (!this.stepValid()) return;

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
        languages: this.buildLanguagesText(),
        collaborationType: this.collaborationType() || undefined,
        expectedRate: this.expectedRate().trim(),
      })
      .subscribe({
        next: () => this.handleSubmitted(),
        error: () => this.handleSubmitted(),
      });
  }

  private buildLanguagesText(): string {
    return this.selectedLanguages()
      .map((l) => {
        const name = l.code.startsWith(CUSTOM_LANGUAGE_PREFIX)
          ? l.code.slice(CUSTOM_LANGUAGE_PREFIX.length)
          : (LANGUAGE_OPTIONS.find((opt) => opt.code === l.code)?.value ?? l.code);
        return `${name} - ${l.level}`;
      })
      .join(', ');
  }

  private handleSubmitted(): void {
    this.submitting.set(false);
    this.submitted.set(true);
    this.#analytics.trackCareersApplicationSubmit(this.targetRole());
  }
}
