import { Component } from '@angular/core';
import { EntitiesComponent } from "../../components/entities/entities.component";

@Component({
  selector: 'app-entities-page',
  standalone: true,
  imports: [EntitiesComponent],
  templateUrl: './entities-page.component.html',
  styleUrl: './entities-page.component.css'
})
export class EntitiesPageComponent {

}
