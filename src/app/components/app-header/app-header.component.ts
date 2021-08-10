import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Store } from '@ngrx/store';
import * as fromAuth from '../../state/reducers/auth.reducer';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnChanges {
  @Input() user: any;
  displayName = '';

  constructor(public authService: AuthService, private store: Store<fromAuth.State>) { }

  ngOnChanges(): void {
    if (!this.user) {
      const localData = localStorage.getItem('user');
      const email = (localData !== null && localData !== '') ? JSON.parse(localData).email : '';
      this.displayName = email.split('.')[0];

    } else {
      if(this.user.email){
        const splitString = this.user.email.split('.');
        if (splitString.length > 0) {
          this.displayName = splitString[0]
        }
      }
    }
  }

  isLoggedIn() {
    if (this.authService.isLoggedIn) {
      return true
    } else {
      return false
    }
  }
}
