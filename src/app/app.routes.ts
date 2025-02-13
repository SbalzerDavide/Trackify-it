import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './shared/auth/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { PersonalAreaComponent } from './pages/personal-area/personal-area.component';
import { NotFoundComponentComponent } from './pages/not-found-component/not-found-component.component';
import { isLoggedinMatch } from './shared/auth/auth.service';
import { BasicEntitiesComponent } from './pages/basic-entities/basic-entities.component';
import { EntitiesPageComponent } from './pages/entities-page/entities-page.component';
import { ActivityComponent } from './components/activity/activity.component';
import { GoalPageComponent } from './pages/goal-page/goal-page.component';
import { ChartsPageComponent } from './pages/charts-page/charts-page.component';

export const routes: Routes = [
  { 
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canMatch: [isLoggedinMatch]
  },
  { 
    path: 'personal', 
    loadComponent: ()=> PersonalAreaComponent, 
    canActivate: [ authGuard ],
    loadChildren: ()=> [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => DashboardComponent
      },
      {
        path: 'home',
        loadComponent: () => HomeComponent
      },
      {
        path: 'basic-entities',
        loadComponent: () => BasicEntitiesComponent
      },
      {
        path: 'entities',
        loadComponent: () => EntitiesPageComponent
      },
      {
        path: 'activity',
        loadComponent: () => ActivityComponent
      },
      {
        path: 'goal',
        loadComponent: () => GoalPageComponent
      },
      {
        path: 'charts',
        loadComponent: () => ChartsPageComponent
      }


    ]
  },
  {
    path: '**',
    component: NotFoundComponentComponent
  }
];
