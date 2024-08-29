import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './shared/auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { PersonalAreaComponent } from './pages/personal-area/personal-area.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { 
    path: 'login', 
    component: LoginComponent,
    // canMatch: [isLoggedinMatch]
  },
  { 
    path: 'personal', 
    loadComponent: ()=> PersonalAreaComponent, 
    canActivate: [ authGuard ],
    loadChildren: ()=> [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => DashboardComponent
      },
      {
        path: 'home',
        loadComponent: () => HomeComponent
      }
    ]
  }
];
