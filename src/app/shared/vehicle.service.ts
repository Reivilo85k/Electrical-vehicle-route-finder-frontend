import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {VehicleModel} from './vehicle-model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  baseUrl = environment.baseUrl;

  constructor(private httpClient: HttpClient) {}

  getAllVehicles(): Observable<Array<VehicleModel>> {
    return this.httpClient.get<Array<VehicleModel>>(this.baseUrl + '/api/vehicle');
  }
}

