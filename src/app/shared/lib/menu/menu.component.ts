import { Component, inject, output } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, MatIcon],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  toggleSideNav = output()

  authService = inject(AuthService)
  router = inject(Router)
  

  async logout() {
    await this.authService.signOut()
    this.router.navigate(['/login'])
  }
}
