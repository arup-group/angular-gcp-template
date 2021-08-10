import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { AuthGuard } from "./auth/auth.guard";
import { FourOhFourComponent } from './components/four-oh-four/four-oh-four.component';
import {AppComponent} from "./app.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register-user',
    component: SignUpComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent
  },
  {
    path: 'home',
    //Todo: Change this to your root component
    component: LoginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'route',
    canActivate: [AuthGuard],
    children: [
      {
        path: ':id/data',
        //Todo: Change this to your custom component
        component: LoginComponent,
        canActivate: [AuthGuard],
      }
      ]
  },
  {
    path: '404',
    component: FourOhFourComponent
  },
  {
    path: '**',
    component: FourOhFourComponent
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
