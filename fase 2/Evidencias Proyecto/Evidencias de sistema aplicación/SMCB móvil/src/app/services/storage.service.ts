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
}