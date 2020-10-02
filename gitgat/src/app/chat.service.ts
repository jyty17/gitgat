import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';

import { AuthService } from './auth.service';

import { map, switchMap, first } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private auth: AuthService,
    private afStore: AngularFirestore
  ) { }

  get() {
    return this.afStore
      .collection('messages')
      .doc()
      .snapshotChanges()
      .pipe(
        map( doc => {
          return { id: doc.payload.id, ...doc.payload.data() };
        }),
        first()
      );
  }

  async create() {
    const { uid } = await this.auth.getUser();

    const data = {
      uid,
      createdAt: Date.now(),
      count: 0,
      messages: []
    }

    const docRef = await this.afStore.collection('chats').add(data);
    return 
  }

  async sendMessage(chatId, content) {
    const { uid } = this.auth.getUser();

    const data = {
      uid,
      content,
      createdAt: Date.now(),
    };

    if (uid) {
      const ref = this.afStore.collection('chats').doc(chatId);
      return ref.update({
        message: firestore.FieldValue.arrayUnion(data)
      });
    }
  }

  joinUsers(chat$: Observable<any>) {
    let chat;
    const joinKeys = {}

    return chat$.pipe(
      switchMap( c => {
        chat = c;
        const uid = Array.from(new Set(c.messages.map( v => v.uid )));

        //Firestore User Doc Reads
        const userDocs = uid.map( u => 
          this.afStore.doc(`users/${u}`).valueChanges()
        );

        return userDocs.length ? combineLatest(userDocs) : of([])
      }),
      map(arr => {
        arr.forEach( v => (joinKeys[(<any>v).uid] = v));
        chat.messages = chat.messages.map( v => {
          return { ...v, user: joinKeys[v.uid]}
        })
      
        return chat;
      })
    )
  }
}
