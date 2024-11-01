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
}
