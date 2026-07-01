import { Injectable } from '@angular/core';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getSnapshot(): DashboardSummary {
    return {
      readinessPercent: 92,
      statusLabel: 'Operational',
      updatedAt: new Date().toISOString(),
    };
  }
}
