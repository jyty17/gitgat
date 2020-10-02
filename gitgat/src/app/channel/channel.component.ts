import { Component, OnInit } from '@angular/core';

import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  chat$: Observable<any>;
  newMsg: string;

  constructor(
    public chat: ChatService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    // const chatId = this.
    const source = this.chat.get();
    this.chat$ = this.chat.joinUsers(source);
  }

  submit(chatId) {
    this.chat.sendMessage(chatId, this.newMsg);
    this.newMsg = '';
  }

  trackByCreated(i, msg) {
    return msg.createdAt;
  }

}
