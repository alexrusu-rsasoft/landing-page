import { Injectable } from '@angular/core';
import { ComplianceControl } from '../models/compliance.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  getControls(): ComplianceControl[] {
    return [
      { id: 'c1', title: 'Policy review', owner: 'Security', completed: true },
      { id: 'c2', title: 'Access log validation', owner: 'IAM', completed: false },
      { id: 'c3', title: 'Evidence retention', owner: 'Operations', completed: true },
    ];
  }
}
