import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../layout/header/header.component";
import { FooterComponent } from "../../layout/footer/footer.component";

import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import { MenuComponent } from "../../shared/lib/menu/menu.component";


@Component({
  selector: 'app-personal-area',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet, MatSidenavModule, MatButtonModule, MenuComponent],
  templateUrl: './personal-area.component.html',
  styleUrl: './personal-area.component.css'
})
export class PersonalAreaComponent {

}
