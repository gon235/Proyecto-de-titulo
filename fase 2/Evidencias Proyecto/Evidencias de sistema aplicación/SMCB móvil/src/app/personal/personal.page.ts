import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

interface Personal {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rango: string;
  rol: string;
}

@Component({
  selector: 'app-personal',
  templateUrl: './personal.page.html',
  styleUrls: ['./personal.page.scss'],
})
export class PersonalPage implements OnInit {
  personales$: Observable<Personal[]>;
  filteredPersonales$: Observable<Personal[]>;
  searchQuery: string = '';
  selectedRol: string = '';
  selectedRango: string = '';
  private searchSubject = new BehaviorSubject<string>('');
  userRole: string = '';
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  userData: any;
  currentUserId: string = '';
  darkMode: boolean = false;

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.personales$ = this.databaseService.getCollection('personal') as Observable<Personal[]>;
    this.filteredPersonales$ = this.personales$;
    this.getCurrentUserRole();

    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
      this.darkMode = prefersDark === 'true';
      document.body.classList.toggle('dark', this.darkMode);
    } else {
      const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDarkMedia.matches;
      document.body.classList.toggle('dark', this.darkMode);
    }
  }

  async getCurrentUserRole() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.databaseService.getDocument('personal', user.uid).subscribe((userData: any) => {
          this.userRole = userData?.rol || '';
        });
      }
    });
  }

  ngOnInit() {
    this.personales$ = this.databaseService.getCollection('personal').pipe(
      map(personales => personales.sort((a, b) => a.nombres.localeCompare(b.nombres)))
    );
    this.setupSearch();
    this.loadUserPhoto();
  }

  loadUserPhoto() {
    this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            if (personal) {
              this.userName = `${personal.nombres}`;
              this.userData = personal;
  
              if (personal.imagen) {
                this.storageService.getFileUrl(personal.imagen).subscribe(
                  (url: string) => {
                    this.userPhotoUrl = url;
                  },
                  (error) => {
                    this.userPhotoUrl = 'assets/default-avatar.svg';
                  }
                );
              } else {
                this.userPhotoUrl = 'assets/default-avatar.svg';
              }
            }
          }
        );
      }
    });
  }

  setupSearch() {
    this.filteredPersonales$ = this.searchSubject.pipe(
      switchMap(searchQuery => 
        this.applyFilter(searchQuery)
      )
    );
  }

  filterPersonales() {
    this.searchSubject.next(this.searchQuery);
  }

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  private applyFilter(query: string): Observable<Personal[]> {
    const normalizedQuery = this.normalizeString(query);
    return this.personales$.pipe(
      map(personales => 
        personales
          .sort((a, b) => a.nombres.localeCompare(b.nombres))
          .filter(personal => 
            (this.selectedRol === '' || personal.rol === this.selectedRol) &&
            (this.selectedRango === '' || personal.rango === this.selectedRango) &&
            (this.normalizeString(personal.nombres).includes(normalizedQuery) ||
            this.normalizeString(personal.apellidos).includes(normalizedQuery) ||
            this.normalizeString(personal.email).includes(normalizedQuery) ||
            this.normalizeString(personal.rango).includes(normalizedQuery) ||
            this.normalizeString(personal.rol).includes(normalizedQuery))
          )
      )
    );
  }

  toggleDarkMode(event: any) {
    this.darkMode = event.detail.checked;
    document.body.classList.toggle('dark', this.darkMode);
    localStorage.setItem('darkMode', String(this.darkMode));
  }

  async signOut() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

}