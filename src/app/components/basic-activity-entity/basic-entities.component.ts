import { Component, inject, OnInit } from '@angular/core';

import { BasicEntitiesService } from '../basic-entities.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { FormBasicActivityComponent } from "./form-basic-activity/form-basic-activity.component";

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-basic-entities',
  standalone: true,
  imports: [ CardComponent, FormBasicActivityComponent, MatButtonModule],
  templateUrl: './basic-entities.component.html',
  styleUrl: './basic-entities.component.css'
})
export class BasicEntities implements OnInit {
  basicEntitiesService = inject(BasicEntitiesService)

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {    
    this.basicEntitiesService.fetchBasicActivities()
  }

  openDialog() {
    this.dialog.open(FormBasicActivityComponent);
  }
}
