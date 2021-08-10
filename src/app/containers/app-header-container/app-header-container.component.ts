import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as GcpActions from '../../state/actions/gcp.actions';
import { webSocket } from 'rxjs/webSocket';
import * as AuthSelectors from '../../state/selectors/auth.selectors';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-app-header-container',
  templateUrl: './app-header-container.component.html',
  styleUrls: ['./app-header-container.component.scss']
})
export class AppHeaderContainerComponent implements OnInit {
  socket: any;
  messages: any[] = [];
  user: any;
  userSubscription: any;

  constructor(private store: Store) { }

  ngOnInit(): void {
    let subject = webSocket({
      url: environment.webSocket,

    });
    subject.subscribe(
        (msg: any) => {
          this.messages.push(msg);
          this.setMessagesInState();
        },
        (err) => console.log(err),
        () => console.log('complete')
      );
    subject.next(JSON.stringify({ op: 'hello' }));
    this.userSubscription = this.store.select(AuthSelectors.selectUser).subscribe(user => {
      if(user !== null) {
        this.user = user;
      }
    });
  }

  setMessagesInState() {
    const messages = this.messages.map(msg => {
      return msg
    })
    this.store.dispatch(GcpActions.newWebSocketMessage({messages: messages}))
  }
}
