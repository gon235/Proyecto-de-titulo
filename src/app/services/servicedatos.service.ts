import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

export interface DatosPersonal {
  id: number;
  nombres: string;
  apellidos: string;
  numeroTelefono: string;
  email: string;
  password: string;
  rango: string;
  imagen: string;
  rol: string;
  modified: number;
}

export interface DatosVehiculo {
  id: number;
  nombrevehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  imagen: string;
  estado: string;
  modified: number;
}

export interface DatosMantencion {
  id: number;
  nombrevehiculo: string;
  nombremantencion: string;
  nivelurgencia: string;
  fechahora: string;
  detalle: string;
  patente: string;
  modified: number;
}

const ITEMS_KEY_PERSONAL = 'DatosPersonal';
const ITEMS_KEY_VEHICULO = 'DatosVehiculo';
const ITEMS_KEY_MANTENCION = 'DatosMantencion';

@Injectable({
  providedIn: 'root'
})
export class ServicedatosService {

  private _storage : Storage | null = null;

  constructor(private storage: Storage) { 
    this.init();
  }
  //se define la creación del storage
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }



  //Método para crear un objeto de datos
  addDatosPersonal(dato: DatosPersonal):Promise<any> {
    return this.storage.get(ITEMS_KEY_PERSONAL).then((datos : DatosPersonal[])=>{
      if (datos) {
        datos.push(dato);
        return this.storage.set(ITEMS_KEY_PERSONAL, datos);
      } else {
        return this.storage.set(ITEMS_KEY_PERSONAL, [dato]);
      }
    })
  }

  //Método que nos permite obtener los datos del storage
  getDatosPersonal():Promise<DatosPersonal[]> {
    return this.storage.get(ITEMS_KEY_PERSONAL);
  }

  //Método que permite actualizar un objeto de datos
  updateDatosPersonal(dato: DatosPersonal):Promise<any> {
    return this.storage.get(ITEMS_KEY_PERSONAL).then((datos : DatosPersonal[])=>{
      if (!datos || datos.length == 0) {
        return null;
      }
      let newDato: DatosPersonal[] = [];
      for (let i of datos) {
        if (i.id === dato.id) {
          newDato.push(dato);
        }
        else {
          newDato.push(i);
        }
      }
      return this.storage.set(ITEMS_KEY_PERSONAL, newDato);
    });
  }

  //Método que nos permite eliminar un objeto de datos
  deleteDatosPersonal(id: number):Promise<DatosPersonal> {
    return this.storage.get(ITEMS_KEY_PERSONAL).then((datos : DatosPersonal[])=>{
      if (!datos || datos.length === 0) {
        return null;
      }
      let toKeep: DatosPersonal[] = [];
      for (let i of datos) {
        if (i.id !== id) {
          toKeep.push(i);
        }
      }
      return this.storage.set(ITEMS_KEY_PERSONAL, toKeep);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Método para crear un objeto de datos vehículo
    addDatosVehiculo(dato: DatosVehiculo):Promise<any> {
      return this.storage.get(ITEMS_KEY_VEHICULO).then((datos : DatosVehiculo[])=>{
        if (datos) {
          datos.push(dato);
          return this.storage.set(ITEMS_KEY_VEHICULO, datos);
        } else {
          return this.storage.set(ITEMS_KEY_VEHICULO, [dato]);
        }
      })
    }
  
    //Método que nos permite obtener los datos del storage
    getDatosVehiculo():Promise<DatosVehiculo[]> {
      return this.storage.get(ITEMS_KEY_VEHICULO);
    }
  
    //Método que permite actualizar un objeto de datos
    updateDatosVehiculo(dato: DatosVehiculo):Promise<any> {
      return this.storage.get(ITEMS_KEY_VEHICULO).then((datos : DatosVehiculo[])=>{
        if (!datos || datos.length == 0) {
          return null;
        }
        let newDato: DatosVehiculo[] = [];
        for (let i of datos) {
          if (i.id === dato.id) {
            newDato.push(dato);
          }
          else {
            newDato.push(i);
          }
        }
        return this.storage.set(ITEMS_KEY_VEHICULO, newDato);
      });
    }
  
    //Método que nos permite eliminar un objeto de datos
    deleteDatosVehiculo(id: number):Promise<DatosVehiculo> {
      return this.storage.get(ITEMS_KEY_VEHICULO).then((datos : DatosVehiculo[])=>{
        if (!datos || datos.length === 0) {
          return null;
        }
        let toKeep: DatosVehiculo[] = [];
        for (let i of datos) {
          if (i.id !== id) {
            toKeep.push(i);
          }
        }
        return this.storage.set(ITEMS_KEY_VEHICULO, toKeep);
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Método para crear un objeto de datos vehículo
    addDatosMantencion(dato: DatosMantencion):Promise<any> {
      return this.storage.get(ITEMS_KEY_MANTENCION).then((datos : DatosMantencion[])=>{
        if (datos) {
          datos.push(dato);
          return this.storage.set(ITEMS_KEY_MANTENCION, datos);
        } else {
          return this.storage.set(ITEMS_KEY_MANTENCION, [dato]);
        }
      })
    }
  
    //Método que nos permite obtener los datos del storage
    getDatosMantencion():Promise<DatosMantencion[]> {
      return this.storage.get(ITEMS_KEY_MANTENCION);
    }
  
    //Método que permite actualizar un objeto de datos
    updateDatosMantencion(dato: DatosMantencion):Promise<any> {
      return this.storage.get(ITEMS_KEY_MANTENCION).then((datos : DatosMantencion[])=>{
        if (!datos || datos.length == 0) {
          return null;
        }
        let newDato: DatosMantencion[] = [];
        for (let i of datos) {
          if (i.id === dato.id) {
            newDato.push(dato);
          }
          else {
            newDato.push(i);
          }
        }
        return this.storage.set(ITEMS_KEY_MANTENCION, newDato);
      });
    }
  
    //Método que nos permite eliminar un objeto de datos
    deleteDatosMantencion(id: number):Promise<DatosMantencion> {
      return this.storage.get(ITEMS_KEY_MANTENCION).then((datos : DatosMantencion[])=>{
        if (!datos || datos.length === 0) {
          return null;
        }
        let toKeep: DatosMantencion[] = [];
        for (let i of datos) {
          if (i.id !== id) {
            toKeep.push(i);
          }
        }
        return this.storage.set(ITEMS_KEY_MANTENCION, toKeep);
      });
    }

}
