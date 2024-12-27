import { Component } from '@angular/core';
import { BasicEntities } from "../../components/basic-activity-entity/basic-entities.component";

@Component({
  selector: 'app-basic-entities-page',
  standalone: true,
  imports: [BasicEntities],
  templateUrl: './basic-entities.component.html',
  styleUrl: './basic-entities.component.css'
})
export class BasicEntitiesComponent {

}
