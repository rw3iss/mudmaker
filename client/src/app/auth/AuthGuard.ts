import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    public constructor(private router: Router, private authService: AuthService) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.authService.isLoggedIn()) {

            console.log('auth guard, loggedin');
            return true;

        } else {

            this.router.navigate([ '/login' ], { queryParams: { returnUrl: state.url } });

            return false;

        }

    }

}