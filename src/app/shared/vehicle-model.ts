export class VehicleModel {
  public constructor(init?: Partial<VehicleModel>) {
    Object.assign(this, init);
  }
  id?: number;
  brand: string;
  capacity: number;
  model: string;
  consumption: number;
  range: number;
}
