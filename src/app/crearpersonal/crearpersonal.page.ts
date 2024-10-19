import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicedatosService, DatosPersonal } from '../services/servicedatos.service';
import { Platform, ToastController, AlertController, IonList } from '@ionic/angular';

@Component({
  selector: 'app-crearpersonal',
  templateUrl: './crearpersonal.page.html',
  styleUrls: ['./crearpersonal.page.scss'],
})

export class CrearpersonalPage implements OnInit {

  datosP: DatosPersonal[] = [];
  newDatoP: DatosPersonal = <DatosPersonal>{};

  @ViewChild('myList') myList!: IonList;

  constructor(private storageService: ServicedatosService, 
    private plt: Platform, private toastController: ToastController, public alertController: AlertController) { 
      this.plt.ready().then(()=>{
        this.loadDatos();
      });
    }

  ngOnInit() {
  }

  //GET
  loadDatos() {
    this.storageService.getDatosPersonal().then(datosP => {
      this.datosP = datosP;
    });
  }

  //CREATE
  addDatosPersonal() {
    this.newDatoP.modified = Date.now();
    this.newDatoP.id = Date.now();
    this.storageService.addDatosPersonal(this.newDatoP).then(dato => {
      this.newDatoP = <DatosPersonal>{};
      //this.showToast('La creación del personal ha sido exitosa');
      this.mensajePersonal('La creación del personal ha sido exitosa');
      this.loadDatos();
    });
  }

  //UPDATE (no funcional del todo bien)
  updateDatosPersonal(dato: DatosPersonal) {
    dato.nombres = `ACTUALIZADO: ${dato.nombres}`;
    dato.modified = Date.now();
    this.storageService.updateDatosPersonal(dato).then(item => {
      this.mensajePersonal('La actualización del personal ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  //DELETE
  deleteDatosPersonal(dato: DatosPersonal) {
    this.storageService.deleteDatosPersonal(dato.id).then(item => {
      this.mensajePersonal('La eliminación del personal ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  onSubmit() {
    console.log('submit');
    console.log(this.datosP);
  }

    async mensajePersonal(msg: string) {
      const alert = await this.alertController.create({
        cssClass: 'secondary',
        header: 'Mensaje',
        message: msg,
        buttons: ['Aceptar'],
      });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);

  }

  async showToast(msg: string){
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }
}

