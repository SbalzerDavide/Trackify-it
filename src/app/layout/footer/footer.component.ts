import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { FormActivityComponent } from '../../components/activity/form-activity/form-activity.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(FormActivityComponent);
  }
}
