import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicedatosService, DatosVehiculo } from '../services/servicedatos.service';
import { Platform, ToastController, AlertController, IonList } from '@ionic/angular';

@Component({
  selector: 'app-crearvehiculo',
  templateUrl: './crearvehiculo.page.html',
  styleUrls: ['./crearvehiculo.page.scss'],
})

export class CrearvehiculoPage implements OnInit {

  datosV: DatosVehiculo[] = [];
  newDatoV: DatosVehiculo = <DatosVehiculo>{};

  @ViewChild('myList') myList!: IonList;

  constructor(private storageService: ServicedatosService, 
    private plt: Platform, private toastController: ToastController, public alertController: AlertController) { 
      this.plt.ready().then(()=>{
        this.loadDatos();
      });
    }

    ngOnInit() {
    }

  // Valida el largo del año a un máximo de 4 números
  validarLargoAno(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  //GET
  loadDatos() {
    this.storageService.getDatosVehiculo().then(datosV => {
      this.datosV = datosV;
    });
  }

  //CREATE
  addDatosVehiculo() {
    this.newDatoV.modified = Date.now();
    this.newDatoV.id = Date.now();
    this.storageService.addDatosVehiculo(this.newDatoV).then(dato => {
      this.newDatoV = <DatosVehiculo>{};
      //this.showToast('La creación del personal ha sido exitosa');
      this.mensajePersonal('La creación del vehículo ha sido exitosa');
      this.loadDatos();
    });
  }

  //UPDATE (no funcional del todo bien)
  updateDatosVehiculo(dato: DatosVehiculo) {
    dato.nombrevehiculo = `ACTUALIZADO: ${dato.nombrevehiculo}`;
    dato.modified = Date.now();
    this.storageService.updateDatosVehiculo(dato).then(item => {
      this.mensajePersonal('La actualización del vehículo ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  //DELETE
  deleteDatosVehiculo(dato: DatosVehiculo) {
    this.storageService.deleteDatosVehiculo(dato.id).then(item => {
      this.mensajePersonal('La eliminación del vehiculo ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadDatos();
    });
  }

  onSubmit() {
    console.log('submit');
    console.log(this.datosV);
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

