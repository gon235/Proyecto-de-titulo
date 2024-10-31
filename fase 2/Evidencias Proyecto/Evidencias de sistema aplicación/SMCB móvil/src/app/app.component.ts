import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private menuController: MenuController
  ) {
    this.authService.user$.subscribe(user => {
      this.showMenu = !!user;
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showMenu = !['login', 'recuperar-password'].some(path => event.urlAfterRedirects.includes(path));
    });
  }

  async signOut() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  toggleMenu() {
    this.menuController.toggle('hamburguesa');
  }
}