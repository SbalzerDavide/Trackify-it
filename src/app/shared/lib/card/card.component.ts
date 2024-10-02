import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule, MatIconModule, MatButtonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  title = input.required<string>();
  description = input<string>();
  editQuantity = input<boolean>(false);
  quantity = input<number>()
  goal = input<any>()
  longText = `The Chihuahua is a Mexican breed of toy dog. It is named for the
  Mexican state of Chihuahua and is among the smallest of all dog breeds. It is
  usually kept as a companion animal or for showing.`;

  updateQuantity = output<number>()

  getProgressValue(value: number , goal: number){
    if(value <= goal){      
      return (value/goal) * 100
    } else{
      return 100
    }
  }


}
