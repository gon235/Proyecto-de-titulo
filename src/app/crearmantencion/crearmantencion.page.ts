import { Component, OnInit, ViewChild } from '@angular/core';
import { ServicedatosService, DatosMantencion, DatosVehiculo } from '../services/servicedatos.service';
import { Platform, ToastController, AlertController, IonList } from '@ionic/angular';

@Component({
  selector: 'app-crearmantencion',
  templateUrl: './crearmantencion.page.html',
  styleUrls: ['./crearmantencion.page.scss'],
})

export class CrearmantencionPage implements OnInit {

  datosM: DatosMantencion[] = []; // Guarda los datos de mantenciones
  datosV: DatosVehiculo[] = []; // Guarda los datos de vehiculos
  newDatoM: DatosMantencion = <DatosMantencion>{}; // Guarda los datos de una nueva mantencion

  @ViewChild('myList') myList!: IonList;

  constructor(
    private storageService: ServicedatosService,
    private plt: Platform,
    private toastController: ToastController,
    public alertController: AlertController
  ) {
    this.plt.ready().then(() => {
      this.loadAllData();
    });
  }

    ngOnInit() {
    }

  /*  
  // Carga los datos de mantenciones y vehiculos
  loadAllData() {
    // Load maintenance data
    this.storageService.getDatosMantencion().then(datosM => {
      if (datosM) {
        console.log('Maintenance data loaded:', datosM);
        this.datosM = datosM;
      } else {
        console.log('No maintenance data found.');
        this.datosM = [];
      }
    });

    // Cargar datos de vehiculos
    this.storageService.getDatosVehiculo().then(datosV => {
      if (datosV) {
        console.log('Vehicle data loaded:', datosV);
        this.datosV = datosV;
      } else {
        console.log('No vehicle data found.');
        this.datosV = [];
      }
    });
  }
    */
  
  // Carga los datos de mantenciones y vehiculos
  loadAllData() {
    // Cargar datos de mantenciones
    this.storageService.getDatosMantencion().then(datosM => {
      if (datosM) {
        console.log('Maintenance data loaded:', datosM);
        this.datosM = datosM;
      } else {
        console.log('No maintenance data found.');
        this.datosM = [];
      }
    });
  
    // Cargar datos de vehiculos
    this.storageService.getDatosVehiculo().then(datosV => {
      if (datosV) {
        console.log('Vehicle data loaded:', datosV);
        // Ordenar los vehículos por nombre
        this.datosV = datosV.sort((a, b) => a.nombrevehiculo.localeCompare(b.nombrevehiculo));
      } else {
        console.log('No vehicle data found.');
        this.datosV = [];
      }
    });
  }

    //GET (se reemplaza con el metodo de arriba que carga todos los datos)
  //loadDatos() {
    //this.storageService.getDatosMantencion().then(datosM => {
      //this.datosM = datosM;
    //});
  //}

  // CREATE
  addDatosMantencion() {
    if (!this.newDatoM.nombrevehiculo) {
      this.mensajePersonal('Por favor seleccione un vehículo');
      return;
    }

    this.newDatoM.modified = Date.now();
    this.newDatoM.id = Date.now();
    
    // Find the selected vehicle to get its patente
    const selectedVehicle = this.datosV.find(v => v.nombrevehiculo === this.newDatoM.nombrevehiculo);
    if (selectedVehicle) {
      this.newDatoM.patente = selectedVehicle.patente;
    }

    this.storageService.addDatosMantencion(this.newDatoM).then(dato => {
      this.newDatoM = <DatosMantencion>{};
      this.mensajePersonal('La creación de la mantención ha sido exitosa');
      this.loadAllData();
    });
  }

  // UPDATE
  updateDatosMantencion(dato: DatosMantencion) {
    dato.modified = Date.now();
    this.storageService.updateDatosMantencion(dato).then(item => {
      this.mensajePersonal('La actualización de la mantención ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadAllData();
    });
  }

  // DELETE
  deleteDatosMantencion(dato: DatosMantencion) {
    this.storageService.deleteDatosMantencion(dato.id).then(item => {
      this.mensajePersonal('La eliminación de la mantención ha sido exitosa');
      this.myList.closeSlidingItems();
      this.loadAllData();
    });
  }

  // Helper method to get vehicle details
  getVehicleDetails(patente: string): DatosVehiculo | undefined {
    return this.datosV.find(v => v.patente === patente);
  }

  // Your existing message and toast methods remain the same
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

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }
}


  //CREATE
/*  addDatosMantencion() {
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

} */