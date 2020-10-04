import { Component } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { auth } from 'firebase/app';

import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Mega Fire Chat';

  constructor(public auth: AuthService, public chat: ChatService) { }
  
}
