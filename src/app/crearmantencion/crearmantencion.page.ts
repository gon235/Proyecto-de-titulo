import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicedatosService, DatosMantencion } from '../services/servicedatos.service';
import { Platform, ToastController, AlertController, IonList } from '@ionic/angular';

@Component({
  selector: 'app-crearmantencion',
  templateUrl: './crearmantencion.page.html',
  styleUrls: ['./crearmantencion.page.scss'],
})

export class CrearmantencionPage implements OnInit {

  datosM: DatosMantencion[] = [];
  newDatoM: DatosMantencion = <DatosMantencion>{};

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
    this.storageService.getDatosMantencion().then(datosM => {
      this.datosM = datosM;
    });
  }

  //CREATE
  addDatosMantencion() {
    this.newDatoM.modified = Date.now();
    this.newDatoM.id = Date.now();
    this.storageService.addDatosMantencion(this.newDatoM).then(dato => {
      this.newDatoM = <DatosMantencion>{};
      //this.showToast('La creación del personal ha sido exitosa');
      this.mensajePersonal('La creación de la mantención ha sido exitosa');
      this.loadDatos();
    });
  }

  //UPDATE (no funcional del todo bien)
  updateDatosMantencion(dato: DatosMantencion) {
    dato.nombrevehiculo = `ACTUALIZADO: ${dato.nombrevehiculo}`;
    dato.modified = Date.now();
    this.storageService.updateDatosMantencion(dato).then(item => {
      this.mensajePersonal('La actualización de la mantención ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  //DELETE
  deleteDatosMantencion(dato: DatosMantencion) {
    this.storageService.deleteDatosMantencion(dato.id).then(item => {
      this.mensajePersonal('La eliminación de la mantención ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  onSubmit() {
    console.log('submit');
    console.log(this.datosM);
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