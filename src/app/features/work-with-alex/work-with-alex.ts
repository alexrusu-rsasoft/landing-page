import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-work-with-alex',
  templateUrl: './work-with-alex.html',
  styleUrl: './work-with-alex.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero],
})
export class WorkWithAlex {}
