import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from "./auth/login/login.component";
import {ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { ToastrModule } from 'ngx-toastr';
import {NgxWebstorageModule} from "ngx-webstorage";
import { CreateVehicleComponent } from './create-vehicle/create-vehicle.component';
import {TokenInterceptor} from './token-interceptor';
import { SignupComponent } from './auth/sign-up/sign-up.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoaderComponent} from './loader/loader.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SignupComponent,
    MapComponent,
    HomeComponent,
    LoginComponent,
    CreateVehicleComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgbModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
