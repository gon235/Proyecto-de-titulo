import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private databaseService: DatabaseService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return new Observable<boolean>(observer => observer.next(false));
        }
        
        return this.databaseService.getDocument('personal', user.uid).pipe(
          map((userData: any) => {
            if (userData && userData.rol !== 'Bombero') {
              return true;
            } else {
              this.router.navigate(['/home']);
              return false;
            }
          })
        );
      })
    );
  }
}