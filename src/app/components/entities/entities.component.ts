import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { EntitiesService } from '../entities.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { FormEntitiesComponent } from './form-entities/form-entities.component';


@Component({
  selector: 'app-entities',
  standalone: true,
  imports: [MatButtonModule, CardComponent],
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.css'
})
export class EntitiesComponent implements OnInit{
  entitiesService = inject(EntitiesService)

  readonly dialog = inject(MatDialog);

  async ngOnInit() {
    await this.entitiesService.fetchEntities()
  }

  openDialog() {
    this.dialog.open(FormEntitiesComponent);
  }

}
