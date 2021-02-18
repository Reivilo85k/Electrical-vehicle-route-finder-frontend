import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import {VehicleModel} from '../shared/vehicle-model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CreateVehicleService {

  baseUrl= environment.baseUrl

  constructor(private httpClient: HttpClient) { }

  createVehicle(vehicleModel : VehicleModel): Observable<VehicleModel>{
    return this.httpClient.post<VehicleModel>(this.baseUrl + 'api/vehicle',
      vehicleModel);
  }
}
