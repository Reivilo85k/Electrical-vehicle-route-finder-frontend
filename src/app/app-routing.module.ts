import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SignupComponent} from "./auth/sign-up/sign-up.component";
import {HomeComponent} from "./home/home.component";
import {MapComponent} from "./map/map.component";
import {LoginComponent} from './auth/login/login.component';
import {CreateVehicleComponent} from './create-vehicle/create-vehicle.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'map/:id', component: MapComponent},
  {path: 'sign-up', component: SignupComponent },
  {path: 'login', component: LoginComponent},
  {path: 'register-vehicle', component: CreateVehicleComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
