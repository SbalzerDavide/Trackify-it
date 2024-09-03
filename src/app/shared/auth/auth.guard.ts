import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, RouterStateSnapshot } from "@angular/router";
import { SupabaseService } from "../supabase/supabase.service";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>{
  const supabaseService = inject(SupabaseService)
  const router = inject(Router)
  if(supabaseService.session){
    return true
  } else{
    return new RedirectCommand(router.parseUrl('login'))
  }
}