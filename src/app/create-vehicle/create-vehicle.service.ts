import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateVehicleResponse} from './create-vehicle-response';
import {VehicleModel} from '../shared/vehicle-model';

const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})

export class CreateVehicleService {



  constructor(private httpClient: HttpClient) { }

  create(createVehicleRequestPayload : CreateVehicleResponse): Observable<VehicleModel>{
    return this.httpClient.post<VehicleModel>('http://localhost:8080/api/vehicle',
      createVehicleRequestPayload);
  }
}
