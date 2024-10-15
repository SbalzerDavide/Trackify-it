import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [MatCardModule],
  styleUrl: './custom-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,  templateUrl: './custom-card.component.html',
})
export class CustomCardComponent {
  title = input<string | undefined>('')
  subtitle = input<string | number | undefined>('')
}
