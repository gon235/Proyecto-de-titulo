import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private firestore: AngularFirestore) {}

  getCollection(collectionName: string) {
    return this.firestore.collection(collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  async getVehicleByPatente(patente: string): Promise<any> {
    const snapshot = await this.firestore.collection('vehiculos').ref
      .where('patente', '==', patente.toUpperCase())
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    } else {
      return null;
    }
  }

  getDocument(collectionName: string, docId: string) {
    return this.firestore.collection(collectionName).doc(docId).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data() as any;
        const id = doc.payload.id;
        return { id, ...data };
      })
    );
  }

  addDocumentWithId(collectionName: string, docId: string, data: any) {
    return this.firestore.collection(collectionName).doc(docId).set(data);
  }

  addDocument(collectionName: string, data: any) {
    return this.firestore.collection(collectionName).add(data);
  }

  updateDocument(collectionName: string, docId: string, data: any) {
    return this.firestore.collection(collectionName).doc(docId).update(data);
  }

  deleteDocument(collectionName: string, docId: string) {
    return this.firestore.collection(collectionName).doc(docId).delete();
  }

  getMantencionesByUser(userId: string) {
    return this.firestore.collection('mantenciones', ref => 
      ref.where('assignedTo', '==', userId)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getAllMantenciones() {
    return this.firestore.collection('mantenciones').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getMantencionesByMecanico(mecanicoId: string) {
    return this.firestore.collection('mantenciones', ref => 
      ref.where('assignedTo', '==', mecanicoId)
         .where('estado', '==', 'Pendiente')
         .where('aceptada', '==', true)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

}
