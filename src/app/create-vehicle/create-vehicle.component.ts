import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CreateVehicleService} from './create-vehicle.service';
import {VehicleModel} from '../shared/vehicle-model';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-create-vehicle',
  templateUrl: './create-vehicle.component.html',
  styleUrls: ['./create-vehicle.component.css']
})
export class CreateVehicleComponent implements OnInit {

  createVehicleForm: FormGroup;
  vehicleModel: VehicleModel;
  registerSuccessMessage: string;
  isError: boolean;

  constructor(private createVehicleService: CreateVehicleService, private router: Router, private toastr: ToastrService) {
    this.createVehicleForm = new FormGroup({
      brand: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      model: new FormControl('', Validators.required),
      capacity: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]),
      consumption: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]),
      range: new FormControl('', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')])
    });
    this.vehicleModel = {
      brand: '',
      capacity: null,
      model: '',
      consumption: null,
      range: null
    }
  }

  ngOnInit() {
  }

  createVehicle() {
    console.log("clicked")
    this.vehicleModel.brand = this.createVehicleForm.get('brand').value;
    this.vehicleModel.model = this.createVehicleForm.get('model').value;
    this.vehicleModel.consumption = this.createVehicleForm.get('capacity').value;
    this.vehicleModel.capacity = this.createVehicleForm.get('consumption').value;
    this.vehicleModel.range = this.createVehicleForm.get('range').value;
    console.log(this.vehicleModel)
    this.createVehicleService.createVehicle(this.vehicleModel).subscribe(()=> {
      this.toastr.success("Vehicle registered")
    }, error => {
      throwError(error);
      });
  }
}
