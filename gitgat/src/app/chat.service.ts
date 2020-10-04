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
      .collection('messages', ref => ref.limit(100).orderBy('createdAt', 'asc'))
      // .doc()
      .snapshotChanges()
      .pipe(
        map( actions => {
          return actions.map( action => { 
            const data: Object = action.payload.doc.data();
            const id = action.payload.doc.id;

            // console.log("Chat Service", { id, ...data });
            return { id, ...data };
          })
        })
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

    const docRef = await this.afStore.collection('messages').add(data);
    return 
  }

  async sendMessage(content) {
    // const { uid } = await this.auth.getUser();
    console.log(await this.auth.getUser());
    const uid = "t";
    // console.log(content);
    const data = {
      uid,
      'message': content,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    console.log(firestore.FieldValue.arrayUnion(data), data);
    if (uid) {
      const ref = this.afStore.collection('messages');
      return ref.doc(this.afStore.createId()).set(data);
    }
  }

  // gets messages respective to users in respective chats
  joinUsers(chat$: Observable<any>) {
    let chat;
    const joinKeys = {};
    
    return chat$.pipe(
      switchMap( c => {
        chat = c;
        // console.log("c", c);
        const uids = Array.from(new Set(c.map( v => v.uid )));
        console.log("valid1", uids);
        //Firestore User Doc Reads
        const userDocs = uids.map( u => 
          this.afStore.doc(`users/${u}`).valueChanges()
        );
        console.log("userDocs: Length, docs, combineLatest", userDocs.length, userDocs);
        return userDocs.length ? userDocs : of([])
        // return userDocs.length ? combineLatest(userDocs) : of([]);
      }),
      // map(a => console.log("check", a)),
      map(arr => {
        console.log("arr", arr, typeof(arr));
        arr.forEach(v => console.log("what is in arr", v));
        arr.forEach( v => (joinKeys[(<any>v).uid] = v));
  
        joinKeys["t"] = chat[0];
        console.log("keys", chat, joinKeys);
        
        chat = chat.map( v => {
          // console.log(v, "joinKeys", joinKeys);
          return { ...v, user: joinKeys[v.uid]}
        })
      
        return chat;
      })
    )
  }
}
