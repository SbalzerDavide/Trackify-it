import { inject, Injectable, signal } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'
import { CanMatchFn, Router } from '@angular/router'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
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

  signOut() {
    return this.supabase.auth.signOut()
  }

  async login(email: string, password: string){
    try{
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      this.session = data.session

      const activeProfile = (await this.getProfile(data.user!)).data
      
      if(activeProfile){
        this.profile.set(activeProfile)        
      }


      return {
        data: data,
        error: error
      } 
    } 
    catch(error){
      console.error(error)
      return { error }
    }
  }

}

export const isLoggedinMatch: CanMatchFn = ()=>{
   const supabaseService = inject(SupabaseService)
   const router = inject(Router)
   if(supabaseService.activeProfile()){
    // return new RedirectCommand(router.parseUrl('/personal')) 
    return false
   } else{
    return true
   }
}