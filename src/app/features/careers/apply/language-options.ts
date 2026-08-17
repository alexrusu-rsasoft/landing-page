export interface LanguageOption {
  code: string;
  flag: string;
  /** Canonical English name, submitted to the form regardless of UI locale. */
  value: string;
  labelKey: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', value: 'English', labelKey: 'careers.apply.languageNames.en' },
  { code: 'de', flag: '🇩🇪', value: 'German', labelKey: 'careers.apply.languageNames.de' },
  { code: 'ro', flag: '🇷🇴', value: 'Romanian', labelKey: 'careers.apply.languageNames.ro' },
  { code: 'fr', flag: '🇫🇷', value: 'French', labelKey: 'careers.apply.languageNames.fr' },
  { code: 'it', flag: '🇮🇹', value: 'Italian', labelKey: 'careers.apply.languageNames.it' },
  { code: 'es', flag: '🇪🇸', value: 'Spanish', labelKey: 'careers.apply.languageNames.es' },
  { code: 'nl', flag: '🇳🇱', value: 'Dutch', labelKey: 'careers.apply.languageNames.nl' },
  { code: 'pt', flag: '🇵🇹', value: 'Portuguese', labelKey: 'careers.apply.languageNames.pt' },
  { code: 'ru', flag: '🇷🇺', value: 'Russian', labelKey: 'careers.apply.languageNames.ru' },
  { code: 'hu', flag: '🇭🇺', value: 'Hungarian', labelKey: 'careers.apply.languageNames.hu' },
  { code: 'pl', flag: '🇵🇱', value: 'Polish', labelKey: 'careers.apply.languageNames.pl' },
];

export const DEFAULT_LANGUAGE_LEVEL = 'B2';

export const LANGUAGE_LEVELS: readonly string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];
