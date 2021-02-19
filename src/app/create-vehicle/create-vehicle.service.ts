import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {VehicleModel} from '../shared/vehicle-model';
import {environment} from '../../environments/environment';
import {AuthService} from '../auth/shared/auth.service';

@Injectable({
  providedIn: 'root'
})

export class CreateVehicleService {

  baseUrl= environment.baseUrl

  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  createVehicle(vehicleModel : VehicleModel): Observable<VehicleModel>{
    let headers = new HttpHeaders().set('Authorization', 'Bearer '
      + this.authService.getJwtToken());
    return this.httpClient.post<VehicleModel>(this.baseUrl + 'api/vehicle',
      vehicleModel, {headers :  headers} );
  }
}
