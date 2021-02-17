import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CreateVehicleRequestPayload} from './create-vehicle-request.payload';
import {Observable} from 'rxjs';
import {CreateVehicleService} from './create-vehicle.service';

@Component({
  selector: 'app-create-vehicle',
  templateUrl: './create-vehicle.component.html',
  styleUrls: ['./create-vehicle.component.css']
})
export class CreateVehicleComponent implements OnInit {

  createVehicleForm: FormGroup;
  createVehicleRequestPayload: CreateVehicleRequestPayload;
  registerSuccessMessage: string;
  isError: boolean;

  constructor(private createVehicleService: CreateVehicleService, private router: Router, private toastr: ToastrService) {
    this.createVehicleRequestPayload = {
      brand: '',
      model: '',
      capacity: null,
      consumption: null,
      range: null,
    };
  }

  ngOnInit() {
    this.createVehicleForm = new FormGroup({
      brand: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      model: new FormControl('', Validators.required),
      capacity: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]),
      consumption: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]),
      range: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')])
    });
  }

  createVehicle() {
    console.log("clicked")
    this.createVehicleRequestPayload.brand = this.createVehicleForm.get('brand').value;
    this.createVehicleRequestPayload.model = this.createVehicleForm.get('model').value;
    this.createVehicleRequestPayload.consumption = this.createVehicleForm.get('capacity').value;
    this.createVehicleRequestPayload.capacity = this.createVehicleForm.get('consumption').value;
    this.createVehicleRequestPayload.range = this.createVehicleForm.get('range').value;

    this.createVehicleService.create(this.createVehicleRequestPayload).subscribe();
  }
}
