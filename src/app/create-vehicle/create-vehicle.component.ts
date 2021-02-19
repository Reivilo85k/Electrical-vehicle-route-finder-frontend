import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CreateVehicleService} from './create-vehicle.service';
import {VehicleModel} from '../shared/vehicle-model';
import {throwError} from 'rxjs';
import {AuthService} from '../auth/shared/auth.service';

@Component({
  selector: 'app-create-vehicle',
  templateUrl: './create-vehicle.component.html',
  styleUrls: ['./create-vehicle.component.css']
})
export class CreateVehicleComponent implements OnInit {

  createVehicleForm: FormGroup;
  vehicleModel: VehicleModel;
  isLoggedIn: boolean;

  constructor(private createVehicleService: CreateVehicleService, private authService : AuthService,
              private router: Router, private toastr: ToastrService) {
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
    };
  }

  ngOnInit(): void {
    this.authService.loggedIn.subscribe((data: boolean) => this.isLoggedIn = data);
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('create', this.isLoggedIn)
  }

  createVehicle() {
    console.log(this.isLoggedIn)
    if (this.isLoggedIn){
    console.log('isLoggedIn',this.isLoggedIn)
    this.vehicleModel.brand = this.createVehicleForm.get('brand').value;
    this.vehicleModel.model = this.createVehicleForm.get('model').value;
    this.vehicleModel.consumption = this.createVehicleForm.get('consumption').value;
    this.vehicleModel.capacity = this.createVehicleForm.get('capacity').value;
    this.vehicleModel.range = this.createVehicleForm.get('range').value;
    console.log(this.vehicleModel)
    this.createVehicleService.createVehicle(this.vehicleModel).subscribe(()=> {
      this.toastr.success("Vehicle registered")
    }, error => {
      throwError(error);
      });
  }else {
      this.toastr.error("You need to log in to register a vehicle")
    }
  }
}
