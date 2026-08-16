// Values must match the Google Form's own choice text exactly (submitted verbatim
// regardless of UI locale), so responses stay consistent in the client's sheet.

export interface ApplyOption {
  value: string;
  labelKey: string;
}

export const AVAILABILITY_OPTIONS: readonly ApplyOption[] = [
  { value: 'Immediately Available (Within 1 week)', labelKey: 'careers.apply.availabilityImmediate' },
  { value: '1-2 Weeks Notice', labelKey: 'careers.apply.availability1to2Weeks' },
  { value: '1 Month Notice', labelKey: 'careers.apply.availability1Month' },
  { value: 'More than 1 Month Notice', labelKey: 'careers.apply.availabilityMoreThanMonth' },
];

export const COLLABORATION_OPTIONS: readonly ApplyOption[] = [
  { value: 'Full-time Employee (Permanent)', labelKey: 'careers.apply.collabFullTime' },
  { value: 'Contractor (B2B)', labelKey: 'careers.apply.collabB2B' },
  { value: 'Part-time', labelKey: 'careers.apply.collabPartTime' },
  { value: 'Freelance Project-based', labelKey: 'careers.apply.collabFreelance' },
];
