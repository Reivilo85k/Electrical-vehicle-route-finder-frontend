import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateVehicleRequestPayload} from './create-vehicle-request.payload';

const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})

export class CreateVehicleService {



  constructor(private httpClient: HttpClient) { }

  create(createVehicleRequestPayload : CreateVehicleRequestPayload): Observable<any>{
    return this.httpClient.post<any>('http://localhost:8080/api/vehicle',
      createVehicleRequestPayload);
  }
}
