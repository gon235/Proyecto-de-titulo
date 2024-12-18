import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: AngularFireStorage) {}

  async uploadFile(path: string, file: File) {
    const ref = this.storage.ref(path);
    return await ref.put(file);
  }

  getFileUrl(path: string): Observable<string> {
    console.log('Getting URL for path:', path);
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // Si ya es una URL, simplemente devuélvela
      return from(Promise.resolve(path));
    } else {
      // Si es una ruta relativa, obtén la URL de descarga
      return this.storage.ref(path).getDownloadURL();
    }
  }

  deleteFile(path: string) {
    return this.storage.ref(path).delete();
  }

    // En storage.service.ts
    async deleteUserFolder(userId: string) {
      const path = `personal/${userId}`;
      try {
        // Obtener una referencia a la carpeta
        const ref = this.storage.ref(path);
        
        // Listar todos los archivos en la carpeta
        const files = await ref.listAll().forEach(async listResult => {
          // Eliminar cada archivo en la carpeta
          const deletePromises = listResult.items.map(item => item.delete());
          await Promise.all(deletePromises);
        });
        
        console.log('Carpeta de usuario eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar la carpeta del usuario:', error);
        throw error;
      }
    }

    async deleteVehicleFolder(vehicleId: string) {
      const path = `vehiculos/${vehicleId}`;
      try {
        // Obtener una referencia a la carpeta
        const ref = this.storage.ref(path);
        
        // Listar todos los archivos en la carpeta
        const files = await ref.listAll().forEach(async listResult => {
          // Eliminar cada archivo en la carpeta
          const deletePromises = listResult.items.map(item => item.delete());
          await Promise.all(deletePromises);
        });
        
        console.log('Carpeta del vehículo eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar la carpeta del vehículo:', error);
        throw error;
      }
    }
}
