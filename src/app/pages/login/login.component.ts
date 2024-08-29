import { Component, inject, input, Input, OnInit } from '@angular/core';
import { AuthSession } from '@supabase/supabase-js'
import { SupabaseService } from '../../supabase.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loading = false

  @Input() session!: AuthSession

  email: string = 'davidesbalzer@gmail.com'
  password: string = 'NeosDav90'

  // session = input!<AuthSession>()

  loginForm = new FormGroup({
    email: new FormControl('',{
      validators: [Validators.required]
    }),
    password: new FormControl('',{
      validators: [Validators.required]
    }),
  })

  supabaseService = inject(SupabaseService)
  router = inject(Router)

  constructor() {}

  ngOnInit(): void {
      
  }

  
  async login(){
    try{
      if(this.loginForm.valid){
        const enteredEmail = this.loginForm.value.email!
        const enteredPassword = this.loginForm.value.password!
        const { data } = await this.supabaseService.login(enteredEmail, enteredPassword)

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

  //     const { error } = await this.supabaseService.updateProfile({
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
    await this.supabaseService.signOut()
  }
}
