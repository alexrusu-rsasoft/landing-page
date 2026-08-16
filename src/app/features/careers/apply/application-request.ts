export interface CareersApplicationRequest {
  fullName: string;
  phone: string;
  email: string;
  availability: string;
  noticeEndDate?: string;
  targetRole: string;
  techStack: string;
  yearsExperience: string;
  languages: string;
  collaborationType?: string;
  expectedRate: string;
}
