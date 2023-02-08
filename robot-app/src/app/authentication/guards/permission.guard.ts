import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    return this.isAuthorized(route);
  }

  isAuthorized(route: ActivatedRouteSnapshot): boolean {
    const permissions = this.authService.getUserPermissions();
    const expectedPermissions = route.data['expectedPermissions'];
    const permissionMatches = permissions.findIndex((permission: any) => expectedPermissions.indexOf(permission) !== -1)
    return (permissionMatches < 0) ? false : true;
  }
  
}
