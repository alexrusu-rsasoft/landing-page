import { Component } from '@angular/core';

interface Edu {
  degree: string;
  school: string;
  period: string;
  icon?: string;
}
interface Cert {
  name: string;
  year: string;
}

@Component({
  selector: 'app-education',
  templateUrl: './education.html',
  styleUrl: './education.css',
})
export class EducationSection {
  readonly education: Edu[] = [
    {
      degree: 'Master in Advanced Informatics Systems',
      school: 'Babeș-Bolyai University of Cluj-Napoca',
      period: '2019 – 2021',
      icon: 'school',
    },
    {
      degree: 'Bachelor in Computer Science with German',
      school: 'Babeș-Bolyai University of Cluj-Napoca',
      period: 'Graduated in 2019',
      icon: 'school',
    },
  ];

  readonly certifications: Cert[] = [
    { name: 'Senior Angular Developer', year: '2026' },
    { name: 'Mid Angular Developer', year: '2026' },
    { name: 'AWS Certified Cloud Practitioner', year: '2025' },
    { name: 'Public Speaking – John Maxwell Team', year: '2017' },
    { name: 'Cybersecurity – Penetration Testing', year: '2017' },
  ];

  readonly organizations = [
    { name: 'German Line Student Representative – UBB', period: '2016–2021' },
    { name: 'Member & Founder – Interact Zalau', period: '2015' },
  ];
}
