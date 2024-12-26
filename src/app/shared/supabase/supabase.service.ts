import { Injectable, signal } from '@angular/core'
import {
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js'
import { environment } from '../../../environments/environment'

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
  supabase: SupabaseClient
  session: AuthSession | null = null
  private profile = signal<Profile | null>(null)
  activeProfile = this.profile.asReadonly()

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }


  // api
  async getFromTable(table: string, columns: string){
    // const data = await this.supabase.from('basic_entities').select(`name, description, unit`)
    //   .eq('user_id', this.session?.user.id)
    // console.log(data);
    
    return this.supabase.from(table).select(columns)
  }

}
