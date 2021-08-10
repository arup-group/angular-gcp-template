import {Component, Inject, Injectable, NgZone} from '@angular/core';
import { Router } from  "@angular/router";
import firebase from 'firebase/app'
import 'firebase/auth';
import { AngularFireAuth } from  "@angular/fire/auth";
import { User } from "src/app/data/models/user";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import * as AuthActions from '../state/actions/auth.actions';
import {MatDialog, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { Subscription } from 'rxjs';
import * as AuthSelectors from '../state/selectors/auth.selectors';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user!: User;
  userData: any; // Save logged in user data
  userFromStore!: User;
  userFromStoreSubscription!: Subscription;
  latestUser: any;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone,
    private store: Store,
    public dialog: MatDialog
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        localStorage.setItem('user', '');
        JSON.parse(localStorage.getItem('user')  || '{}');
      }
    })
  }

  openDialog(title:string, message: string) {
    const dialogRef = this.dialog.open(LoginMessageDialog,{
      data: {
        title:title,
        message: message
      }
    });
  }

  // Sign in with email/password
  SignIn(email: any, password: any) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.store.select(AuthSelectors.selectUser).subscribe(user => {
          if(user && user !== 'undefined') {
            this.latestUser = user;
            this.router.navigate(['/projects']);
          }
        });
        this.SetUserData(result.user);
      }).catch((error) => {
        this.openDialog('Could not log in',error.message)
      })
  }

  // Sign up with email/password
  SignUp(email: any, password: any) {
    const emailDomain = email.split('@');
    if (!emailDomain[1].includes('sidewalk')) {
      return this.openDialog('Not permitted','You do not have the required credentials to sign up for this site')
    } else {
      return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result: any) => {
        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user);
      }).catch((error) => {
          this.openDialog('Error', error.message)
      })
    }
  }

  // Email verification when new user register
  SendVerificationMail() {
    return this.afAuth.currentUser.then((u: any) => u.sendEmailVerification())
    .then(() => {
      this.router.navigate(['verify-email']);
    })
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: any) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      this.openDialog('Password Reset', 'Password reset email sent, check your inbox.')
    }).catch((error: any) => {
        this.openDialog('Error',error.message)
    })
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    if (Object.keys(user).length === 0){
      user = this.latestUser;
    }
    if (!user) {
      return false;
    } else {
      return ((Object.keys(user).length !== 0) && user.emailVerified !== false) ? true : false
    }
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['projects']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
        this.openDialog('Error',error.message)
    })
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    this.store.dispatch(AuthActions.setUser({ user: userData }));
    return userRef.set(userData, {
      merge: true
    })
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.store.dispatch(AuthActions.setUser({ user: {} }));
      this.router.navigate(['login']);
    })
  }

}

export interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'login-message-dialog',
  templateUrl: 'login/login-message-dialog.html',
})
export class LoginMessageDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}


