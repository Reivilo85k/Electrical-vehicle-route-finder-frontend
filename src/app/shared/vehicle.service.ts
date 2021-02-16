import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VehicleModel} from './vehicle-model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private httpClient: HttpClient) {}

  getAllVehicles(): Observable<Array<VehicleModel>> {
    return this.httpClient.get<Array<VehicleModel>>('http://localhost:8080/api/vehicle');
  }
}
