import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { SupabaseService } from "../../supabase.service";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>{
  const supabaseService = inject(SupabaseService)
  if(supabaseService.session){
    return true
  } else{
    return false
  }
}