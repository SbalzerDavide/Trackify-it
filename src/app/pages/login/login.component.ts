import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { AuthSession } from '@supabase/supabase-js'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loading = signal<boolean>(false)

  errorMessage = signal<string>('');
  hide = signal(true);

  // @Input() session!: AuthSession

  // session = input!<AuthSession>()

  loginForm = new FormGroup({
    email: new FormControl('',{
      validators: [Validators.required]
    }),
    password: new FormControl('',{
      validators: [Validators.required]
    }),
  })

  updateErrorMessage() {
    this.errorMessage.set('You must enter a value');

    // if (this.email.hasError('required')) {
    //   this.errorMessage.set('You must enter a value');
    // } else if (this.email.hasError('email')) {
    //   this.errorMessage.set('Not a valid email');
    // } else {
    //   this.errorMessage.set('');
    // }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  authService = inject(AuthService)
  router = inject(Router)

  constructor() {}

  async ngOnInit(): Promise<void> {
    try{
      const access_token = window.sessionStorage.getItem('access_token')
      const refresh_token = window.sessionStorage.getItem('refresh_token')
      if(access_token && refresh_token){    
        this.loading.set(true)
        await this.authService.setSessionData(access_token, refresh_token)
        
        if(this.authService.session){
          this.loading.set(false)
          this.router.navigate(['personal'])
        } else{
          this.loading.set(false)
        }
      } else{
        this.loading.set(false)
      }
    } catch(error){
      console.log("error");
      
      console.error(error)
      this.loading.set(false)
    }
  
  }

  
  async login(){
    try{
      if(this.loginForm.valid){
        const enteredEmail = this.loginForm.value.email!
        const enteredPassword = this.loginForm.value.password!
        await this.authService.login(enteredEmail, enteredPassword)

        // redirect
        this.router.navigate(['personal'])
      }
    } catch(error){
      console.log(error);
    }
  }


  // async updateProfile(): Promise<void> {
  //   try {
  //     this.loading = true
  //     const { user } = this.session

  //     const username = this.updateProfileForm.value.username as string
  //     const website = this.updateProfileForm.value.website as string
  //     const avatar_url = this.updateProfileForm.value.avatar_url as string

  //     const { error } = await this.authService.updateProfile({
  //       id: user.id,
  //       username,
  //       website,
  //       avatar_url,
  //     })
  //     if (error) throw error
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       alert(error.message)
  //     }
  //   } finally {
  //     this.loading = false
  //   }
  // }

  async signOut() {
    await this.authService.signOut()
  }
}
