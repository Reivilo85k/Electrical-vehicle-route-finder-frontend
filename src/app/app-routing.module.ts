import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SignUpComponent} from "./auth/sign-up/sign-up.component";
import {HomeComponent} from "./home/home.component";
import {MapComponent} from "./map/map.component";
import {LoginComponent} from './auth/login/login.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'map/:id', component: MapComponent},
  { path: 'sign-up', component: SignUpComponent },
  {path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
