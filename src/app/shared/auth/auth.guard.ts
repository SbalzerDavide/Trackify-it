import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, RedirectCommand, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>{
  const authService = inject(AuthService)
  const router = inject(Router)
  if(authService.session){
    return true
  } else{
    return new RedirectCommand(router.parseUrl('login'))
  }
}