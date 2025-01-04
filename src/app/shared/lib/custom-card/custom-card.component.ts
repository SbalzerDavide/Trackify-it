import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  styleUrl: './custom-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,  templateUrl: './custom-card.component.html',
})
export class CustomCardComponent {
  title = input<string | undefined>('')
  subtitle = input<string | number | undefined>('')
  settings = input<boolean>(false)

  openSettings = output<Event>()
}
