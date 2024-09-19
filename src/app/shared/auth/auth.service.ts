import { inject, Injectable, signal } from '@angular/core';
import { AuthSession, createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CanMatchFn, RedirectCommand, Router } from '@angular/router';

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient
  session: AuthSession | null = null

  private profile = signal<Profile | null>(null)
  activeProfile = this.profile.asReadonly()

  
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }


  getProfile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }

  async login(email: string, password: string){
    try{
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      
      this.session = data.session
      if(this.session?.access_token && this.session.refresh_token){
        window.sessionStorage.setItem('access_token', this.session?.access_token!)
        window.sessionStorage.setItem('refresh_token', this.session?.refresh_token!)

        const{ data } = await this.getProfile(this.session.user!)
        this.profile.set(data)        
      }

      if(error){
        console.error(error.message)
      }

      return {
        data: data,
      } 
    } 
    catch(error){
      console.error(error)
      return { error }
    }
  }

  // updateProfile(profile: Profile) {
  //   const update = {
  //     ...profile,
  //     updated_at: new Date(),
  //   }

  //   return this.supabase.from('profiles').upsert(update)
  // }

  signOut() {
    return this.supabase.auth.signOut()
  }

  async setSessionData(access_token: string, refresh_token: string){
    console.log('try');
    
    try{
      const { data } = await this.supabase.auth.setSession({
        access_token,
        refresh_token
      })
      this.session = data.session
      if(this.session){
        const{ data } = await this.getProfile(this.session.user!)
        this.profile.set(data)        
      }
    } catch(error){      
      console.log('errrr');
      
      console.error(error)
    }
  }
  
}

export const isLoggedinMatch: CanMatchFn = ()=>{
  const authService = inject(AuthService)
  const router = inject(Router)

  const access_token = window.sessionStorage.getItem('access_token')
  const refresh_token = window.sessionStorage.getItem('refresh_token')
  if(access_token && refresh_token){    
    authService.setSessionData(access_token, refresh_token)
  }

  if(authService.session){    
    return new RedirectCommand(router.parseUrl('/personal')) 
  } else{
    return true
  }
}
