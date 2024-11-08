import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular'; // Platform for web app detection
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = true;
  darkMode: boolean = false;
  public isWeb: boolean = false; // public Var to detect web app user

  constructor(
    private authService: AuthService, 
    private router: Router,
    private menuController: MenuController,
    private platform: Platform // platform constructor for web app detection
  ) {
    // Detect if app is running on web
    this.isWeb = this.platform.is('desktop') || this.platform.is('pwa') || this.platform.is('tablet'); // Added detection logic

    // Verificar el modo oscuro guardado
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      this.toggleDarkMode();
    } else {
      // Verificar preferencia del sistema
      const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDarkMedia.matches;
      this.toggleDarkMode();
    }

    this.authService.user$.subscribe(user => {
      this.showMenu = !!user;
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showMenu = !['login', 'recuperar-password'].some(path => event.urlAfterRedirects.includes(path));
    });
  }

  toggleDarkMode() {
    // Aplicar el tema oscuro al documento
    document.body.classList.toggle('dark', this.darkMode);
    
    // Guardar preferencia
    localStorage.setItem('darkMode', String(this.darkMode));
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
