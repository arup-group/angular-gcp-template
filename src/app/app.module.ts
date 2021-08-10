// angular modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexModule } from '@angular/flex-layout';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { HttpClientModule } from '@angular/common/http';

// ngrx modules
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './state/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

// effects
import { AuthEffects } from './state/effects/auth.effects';

// reducers
import * as fromGcp from './state/reducers/gcp.reducer';
import * as fromAuth from './state/reducers/auth.reducer';

// components
import { AppComponent } from './app.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { FourOhFourComponent } from './components/four-oh-four/four-oh-four.component';

// containers
import { AppHeaderContainerComponent } from './containers/app-header-container/app-header-container.component';
import { LoginPageContainerComponent } from './containers/login-page-container/login-page-container.component';

// environments
import { environment } from '../environments/environment';

//services
import {AuthService, LoginMessageDialog} from './auth/auth.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

var config = {
  apiKey: environment.firebaseApiKey,
  authDomain: '<PROJECT_NAME>.firebaseapp.com',
  projectId: '<PROJECT_NAME>',
  storageBucket: '<PROJECT_NAME>.appspot.com',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

@NgModule({
  declarations: [
    AppComponent,
    AppHeaderComponent,
    AppHeaderContainerComponent,
    LoginPageContainerComponent,
    ConfirmDialogComponent,
    FourOhFourComponent,
    LoginMessageDialog,
    LoginComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexModule,
    MaterialModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
    }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    StoreRouterConnectingModule.forRoot(),
    StoreModule.forFeature(fromAuth.authFeatureKey, fromAuth.reducer),
    StoreModule.forFeature(fromGcp.gcpFeatureKey, fromGcp.reducer),
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [AuthService ],
  bootstrap: [AppComponent],
})
export class AppModule {}
