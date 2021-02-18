import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {VehicleModel} from '../shared/vehicle-model';

@Injectable({
  providedIn: 'root'
})

export class CreateVehicleService {

  constructor(private httpClient: HttpClient) { }

  create(vehicleModel : VehicleModel): Observable<VehicleModel>{
    return this.httpClient.post<VehicleModel>('http://localhost:8080/api/vehicle',
      vehicleModel);
  }
}
