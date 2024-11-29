import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { MenuController, Platform, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mantencion-detalle',
  templateUrl: './mantencion-detalle.page.html',
  styleUrls: ['./mantencion-detalle.page.scss'],
})
export class MantencionDetallePage implements OnInit {
  mantencion: any = {};
  isEditing: boolean = false;
  vehiculo: any;
  originalMantencionData: any;
  canEdit: boolean = false;
  currentUser: any;
  canAccept: boolean = false;
  canComment: boolean = false;
  newComment: string = '';
  selectedFile: File | null = null;
  userPhotoUrl: string = 'assets/default-avatar.svg';
  userName: string = '';
  currentUserId: string = '';
  darkMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService,
    private storageService: StorageService,
    private menuCtrl: MenuController,
    private platform: Platform
) {
    // Inicializar menú cuando la plataforma esté lista
    this.platform.ready().then(() => {
        this.enableMenu();
    });

    // Configuración del modo oscuro
    const prefersDark = localStorage.getItem('darkMode');
    if (prefersDark !== null) {
        this.darkMode = prefersDark === 'true';
        document.body.classList.toggle('dark', this.darkMode);
    } else {
        const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
        this.darkMode = prefersDarkMedia.matches;
        document.body.classList.toggle('dark', this.darkMode);
        
        // Observer para cambios en el modo oscuro del sistema
        prefersDarkMedia.addEventListener('change', (e) => {
            this.darkMode = e.matches;
            document.body.classList.toggle('dark', this.darkMode);
            localStorage.setItem('darkMode', String(this.darkMode));
        });
    }
}

  ngOnInit() {
    // Habilitar el menú lateral
    this.menuCtrl.enable(true);
    this.enableMenu();

    // Agregar listener para el estado del menú
    this.menuCtrl.isEnabled('main-menu').then(enabled => {
        if (!enabled) {
            this.enableMenu();
        }
    });
    
    this.loadUserPhoto();
    this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.databaseService.getDocument('personal', user.uid);
        }
        return new Observable<null>(subscriber => subscriber.next(null));
      })
    ).subscribe(userData => {
      this.currentUser = userData;
      this.canEdit = userData && userData.rol !== 'Bombero';
      this.canAccept = userData && (userData.rol === 'Mecánico' || userData.rol === 'Supervisor');
      this.canComment = userData && (userData.rol === 'Mecánico' || userData.rol === 'Supervisor');
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMantencionData();
    }
  }

async enableMenu() {
  await this.menuCtrl.enable(true, 'main-menu');
  await this.menuCtrl.swipeGesture(true, 'main-menu');
}

async toggleMenu() {
  const isOpen = await this.menuCtrl.isOpen('main-menu');
  if (isOpen) {
      await this.menuCtrl.close('main-menu');
  } else {
      await this.menuCtrl.open('main-menu');
  }
}

ionViewWillEnter() {
  this.menuCtrl.enable(true, 'main-menu');
  this.menuCtrl.swipeGesture(true, 'main-menu');
}

  loadUserPhoto() {
    this.authService.user$.subscribe(user => {
      if (user && user.uid) {
        this.currentUserId = user.uid;
        this.databaseService.getDocument('personal', user.uid).subscribe(
          (personal: any) => {
            if (personal) {
              this.userName = `${personal.nombres}`;
              
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

  loadMantencionData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.databaseService.getDocument('mantenciones', id).subscribe(
        (data) => {
          this.mantencion = data;
          if (!this.mantencion.estado) {
            this.mantencion.estado = 'pendiente';
          }
          this.originalMantencionData = { ...this.mantencion };
          this.cargarDatosVehiculo();
        },
        (error) => {
          console.error('Error fetching mantencion details:', error);
        }
      );
    }
  }

  cargarDatosVehiculo() {
    if (this.mantencion && this.mantencion.nombrevehiculo) {
      const [nombrevehiculo, patente] = this.mantencion.nombrevehiculo.split(' - Patente ');
      this.databaseService.getCollection('vehiculos').subscribe(
        (vehiculos: any[]) => {
          this.vehiculo = vehiculos.find(v => v.nombrevehiculo === nombrevehiculo && v.patente === patente);
        },
        (error) => {
          console.error('Error fetching vehicle details:', error);
        }
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  toggleEdit() {
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    if (!this.isEditing) {
      this.originalMantencionData = { ...this.mantencion };
    } else {
      this.saveChanges();
    }
    this.isEditing = !this.isEditing;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.mantencion && this.originalMantencionData) {
      this.mantencion.nombremantencion = this.originalMantencionData.nombremantencion;
      this.mantencion.nivelurgencia = this.originalMantencionData.nivelurgencia;
      this.mantencion.detalle = this.originalMantencionData.detalle;
      this.mantencion.estado = this.originalMantencionData.estado;
    }
  }

  saveChanges() {
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    if (this.mantencion && this.mantencion.id) {
      this.databaseService.updateDocument('mantenciones', this.mantencion.id, this.mantencion)
        .then(() => {
          console.log('Cambios guardados exitosamente');
          this.isEditing = false;
          this.router.navigate(['/mantencion-detalle', this.mantencion.id]);
        })
        .catch((error) => {
          console.error('Error al guardar los cambios:', error);
        });
    }
  }

  async deleteMantencion() {
    if (!this.canEdit) {
      this.showNoPermissionAlert();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar esta mantención? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Eliminar',
          handler: () => {
            this.confirmDeleteMantencion();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteMantencion() {
    if (this.mantencion && this.mantencion.id) {
      try {
        await this.databaseService.deleteDocument('mantenciones', this.mantencion.id);
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'La mantención ha sido eliminada correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error al eliminar la mantención:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al eliminar la mantención.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  async showNoPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'No tienes permisos para editar mantenciones',
      buttons: ['OK']
    });
    await alert.present();
  }

  async acceptMantencion() {
    if (!this.currentUser || !this.mantencion || this.mantencion.estado === 'Completa') return;
  
    const alert = await this.alertController.create({
      header: 'Confirmar aceptación',
      message: '¿Estás seguro que deseas aceptar esta mantención?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              if (!this.mantencion.acceptances) {
                this.mantencion.acceptances = [];
              }
  
              const acceptanceRecord = {
                userId: this.currentUser.id,
                userName: `${this.currentUser.nombres} ${this.currentUser.apellidos}`,
                rol: this.currentUser.rol,
                date: new Date().toISOString()
              };
  
              this.mantencion.acceptances.push(acceptanceRecord);
              this.mantencion.assignedTo = this.currentUser.id;
              this.mantencion.assignedToName = `${this.currentUser.nombres} ${this.currentUser.apellidos}`;
              this.mantencion.lastAssignmentDate = new Date().toISOString();
              this.mantencion.aceptada = true; // Agregamos esta línea
  
              await this.databaseService.updateDocument('mantenciones', this.mantencion.id, this.mantencion);
              
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Mantención asignada correctamente',
                buttons: ['OK']
              });
              await successAlert.present();
              
              this.loadMantencionData();
            } catch (error) {
              console.error('Error al aceptar la mantención:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo aceptar la mantención',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async addComment() {
    if (!this.currentUser || !this.newComment.trim() || !this.canComment) return;

    const comment: any = {
      userId: this.currentUser.id,
      userName: `${this.currentUser.nombres} ${this.currentUser.apellidos}`,
      text: this.newComment,
      date: new Date().toISOString()
    };

    if (this.selectedFile) {
      const path = `mantenciones/${this.mantencion.id}/comments/${Date.now()}_${this.selectedFile.name}`;
      await this.storageService.uploadFile(path, this.selectedFile);
      const imageUrl = await this.storageService.getFileUrl(path).toPromise();
      comment.imageUrl = imageUrl;
    }

    if (!this.mantencion.comments) {
      this.mantencion.comments = [];
    }

    this.mantencion.comments.push(comment);
    await this.databaseService.updateDocument('mantenciones', this.mantencion.id, this.mantencion);
    
    this.newComment = '';
    this.selectedFile = null;
  }

  viewFullImage(imageUrl: string) {
    window.open(imageUrl, '_blank');
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