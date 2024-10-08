import { Component, signal } from '@angular/core';

import { RangeBarComponent } from '../../shared/lib/range-bar/range-bar.component';

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [RangeBarComponent],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.css'
})
export class ChartsPageComponent {

  rangeType = signal<'weekly' | 'monthly' | 'annual'>('weekly')



  onChangeRange(rangeType: 'daily' | 'weekly' | 'monthly' | 'annual' | null){
    console.log(rangeType);
  }


}
