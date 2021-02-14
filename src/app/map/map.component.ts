import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{

  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  id: number;


  constructor(@Inject(DOCUMENT) private document: Document) {
    this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
  }

  mapCenter = { lat: 59.428, lng: 24.76};
  canReachDestinationWithoutRecharge = true;
  start;
  end;
  chargingPointsMarkers = [];
  markerArray = [];
  stopoverMarkers = [];
  vehicle1 = {capacity: 33, status: 48, consumption: 6.6666}; // 1KW = 6.6666 Km; Capacity in KM = status*consumption;
  APIKey = environment.openchargemaps.API_KEY;

  ngOnInit(): void {
    this.initMap();
  }

  populateCarSelection(): void{
  }

  // ############# Map initialization #######################################
  initMap(): void {
    // Create the map, the DirectionsService, the DirectionsRenderer and an eventListener for the GO button
    // If I chose to implement a detailed steps display it would also be created here
    const directionsService = new google.maps.DirectionsService();

    const mapOptions: google.maps.MapOptions = {
      scaleControl: true,
      center: this.mapCenter,
      zoom: 7,
    };
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    const directionsRenderer = new google.maps.DirectionsRenderer({map: this.map});

    // const stepDisplay = new google.maps.InfoWindow();

    const geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', () => {
      this.setupMap(geocoder, directionsRenderer, directionsService);
    });
  }

  // ############# Map reset and Start+End markers creation #######################################
  async setupMap(geocoder, directionsRenderer, directionsService): Promise<void> {
    // the method is launched by the eventListener
    // it resets the map if it has already been used, sets up the start and end points as Google markers in an array
    // and launches the callbackHandler method
    this.resetMarkers();
    const startEndPointsArray =  await this.setupRoutingProcess(geocoder);
    console.log('created startEndPointsArray', startEndPointsArray);

    await this.callbackHandler(startEndPointsArray, directionsRenderer,
      directionsService, this.calculateAndDisplayRoute);
  }

  resetMarkers(): void {
    // Pushes all visible markers to a same array,
    // launches the different reset processes and
    // deletes all markers in the arrays by removing references to them.
    for (const item of this.chargingPointsMarkers) {
      this.markerArray.push(item);
    }
    this.chargingPointsMarkers = [];

    for (const item of this.stopoverMarkers) {
      this.markerArray.push(item);
    }
    this.stopoverMarkers = [];
    this.clearMarkers(null);
    this.markerArray = [];
    console.log('deleted markers');
  }

  clearMarkers(map): void {
    // Sets the map on all markers in the array.
    for (const item of this.markerArray) {
      item.setMap(map);
    }
    console.log('cleared markers');
  }

  async setupRoutingProcess(geocoder): Promise<any[]> {
    // launches the setGeocodeAddress method for both start and end points and stores them in an array
    this.start = await this.setGeocodeAddress(geocoder, this.map, 'start');
    this.end = await this.setGeocodeAddress(geocoder, this.map, 'end');
    const startEndPointsArray = [this.start];
    startEndPointsArray.push(this.end);
    return startEndPointsArray;

  }

  async setGeocodeAddress(geocoder, resultsMap, elementId): Promise<unknown> {
    // Retrieve the addresses (strings) from the html text boxes and uses Geocoder to Google Markers objects.
    // it pushes those markers in an array later used to delete the markers on the map
    // @ts-ignore
    const address = this.document.getElementById(elementId).value;
    return new Promise(resolve => geocoder.geocode({address},
      (results, status) => {
        if (status === 'OK') {
          resultsMap.setCenter(results[0].geometry.location);
          const marker = new google.maps.Marker({
            map: resultsMap,
            position: results[0].geometry.location,
            title: elementId,
          });
          resolve(marker);
          this.markerArray.push(marker);
        } else {
          alert('Trip Route finder was not successful for the following reason: ' + status);
        }
      }));
  }

  // ############# CallbackHandler calls the app main two processes #######################################
  async callbackHandler(startEndPointsArray,
                        directionsRenderer,
                        directionsService,
                        calculateAndDisplayRoute): Promise<void> {
    // CallbackHandler launches the two processes of the route calculation:
    // 1. Creating a polyline, fetching the EV charging stations along this polyline, creating Google markers from them
    //    on the map and pushing those markers in an array.
    // 2. Selecting which EV charging stations will be stopovers and calculating the route using Google DirectionService.
    await this.setChargingStationsMarkers();
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService);
  }
  // ############# 1. Creating and setting markers for EV charging points #######################################
  async setChargingStationsMarkers(): Promise<void> {
    // Creates an encoded polyline to be passed as an Url argument to limit the results
    // fetches the EV Charging Points as Json response
    const polyline = await this.createPolyline();
    console.log('Polyline created', polyline);
    const polylineMarkersArray = await this.createMarkersOnPolyline(polyline);
    console.log('Polyline Markers created', polylineMarkersArray);

    const baseUrl = 'https://api.openchargemap.io/v3/poi/?output=json&key=' + this.APIKey +
      '&maxresults=100&verbose=false&includecomments=true';

    for (let j = 0; j < polylineMarkersArray.length - 1; j++) {
      const origin = polylineMarkersArray[j].getPosition();
      const destination = polylineMarkersArray[j + 1].getPosition();
      const route = await this.createRoute(origin, destination);
      const encodedPolyline = route.overview_polyline;
      const queryUrl = baseUrl + '&polyline=' + encodedPolyline + '&distance=50';
      await fetch(queryUrl)
        .then((response) => response.json())
        .catch(reason => console.error(reason))
        .then( async (data) => await this.createChargerPointMarkers(data))
        .catch(reason => console.log(reason))
        .then (() => {
          const k = j + 1;
          const l = polylineMarkersArray.length - 1;
          if (j === polylineMarkersArray.length - 2) {
            console.log('loop ' + k + ' of ' + l);
            console.log('EV markers creation finished');
          }else{
            console.log('loop ' + k + ' of ' + l);
          }
        });
    }
  }

  createChargerPointMarkers(jsonChargingPoints): void {
    // Convert the Json response elements to Google Markers, places them on the Map and pushes them to an array.
    for (const item of jsonChargingPoints) {
      const LatLng = new google.maps.LatLng(parseFloat(item.AddressInfo.Latitude), parseFloat(item.AddressInfo.Longitude));
      const marker = this.createMarker(LatLng);
      this.markerArray.push(marker);
      this.chargingPointsMarkers.push(marker);
    }
  }
  createMarker(latLng): google.maps.Marker {
    // Create a marker but do not place it on the map.
    const marker = new google.maps.Marker({
      position: latLng,
    });
    return marker;
  }

  async createPolyline(): Promise<google.maps.Polyline> {
    // Retrieves the encoded overview_polyline from a Google DirectionsRoute object, decodes it to create a path
    // object a creates a Google Polyline with it.
    const origin = this.start.getPosition();
    const destination =  this.end.getPosition();
    const route = await this.createRoute(origin, destination);
    console.log('Route created', route);
    const encodedPolyline = route.overview_polyline;
    console.log('Encoded Polyline retrieved', encodedPolyline);
    const polylinePath = google.maps.geometry.encoding.decodePath(encodedPolyline);
    const polyline = new google.maps.Polyline({
      path: polylinePath,
      strokeColor: '#ff0000',
      strokeOpacity: 0.00001,
      strokeWeight: 0,
    });
    return polyline;
  }

  async createRoute(point1, point2): Promise<google.maps.DirectionsRoute> {
    // Returns a Google DirectionsRoute object
    const directionsService = new google.maps.DirectionsService();
    const request = {
      origin: point1,
      destination: point2,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };
    return new Promise(resolve => directionsService.route(request,
      (result, status) => {
        if (status === 'OK') {
          resolve(result.routes[0]);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      })
    );
  }

  async createMarkersOnPolyline(polyline): Promise<any[]> {
    let i = 1;
    let markerDistanceFromStart = 0;
    let remainingDist = google.maps.geometry.spherical.computeLength(polyline.getPath());
    console.log('Total distance is ' + remainingDist + ' km.');
    const polylineMarkersArray = [];
    let o = 1;

    // create an array of markers placed every 500km. all along the polyline
    polylineMarkersArray.push(this.start);
    while (remainingDist > 500000) {
      const markerLatLng = await polyline.GetPointAtDistance(500000 * i);
      console.log('markerLatLng ' + o, markerLatLng);
      o++;
      const polylineMarker = await this.createMarker(markerLatLng);
      polylineMarkersArray.push(polylineMarker);
      remainingDist -= 500000;
      i++;
      markerDistanceFromStart += 500;
      console.log('Marker created at ' + polylineMarker.getTitle() + ' from the start', polylineMarker);
      console.log('Remaining distance is ' + remainingDist / 1000 + ' km.');
    }
    polylineMarkersArray.push(this.end);
    return polylineMarkersArray;
  }

  // ############# 2. Calculating the route from the Start/End positions and EV charging points markers ################
  async calculateAndDisplayRoute(
    directionsRenderer,
    directionsService): Promise<void> {

    console.log('route calculation started');

    if (!this.compareVehicleCapacityToDistance(this.vehicle1, this.start)) {
      this.canReachDestinationWithoutRecharge = false;
    }

    if (this.canReachDestinationWithoutRecharge === false){
      await this.setChargeCheckpointHandler(this.vehicle1, this.start);
    }

    directionsService.route(this.setRequest(),
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          console.log('route calculation terminated');
          // showSteps(result, markerArray, stepDisplay, map);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
  }

  async setChargeCheckpointHandler(vehicle, lastCheckPoint): Promise<void> {
    await this.setChargeCheckpoint(vehicle, lastCheckPoint);
    const lastIndex =  this.stopoverMarkers.length - 1;
    const lastStop = this.stopoverMarkers[lastIndex];
    console.log('lastIndex', this.stopoverMarkers[lastIndex].position);

    this.canReachDestinationWithoutRecharge = true;

    if (!this.compareVehicleCapacityToDistance(this.vehicle1, lastStop)) {
      this.canReachDestinationWithoutRecharge = false;
    }

    if (this.canReachDestinationWithoutRecharge === false){
      await this.setChargeCheckpointHandler(vehicle, lastStop);
    }
  }
  setChargeCheckpoint(vehicle, lastCheckpoint): void {
    // launches the function selecting the closest marker to destination
    // Setting a marker of the selected marker on the map (might be redundant)
    // Pushes it to markerArray for later deletion (might be redundant)
    // Pushes it to stopoverMarkers to be used by the Directions service to setup a route
    const waypoint = this.selectMarkerClosestToDestination(vehicle, lastCheckpoint);
    const waypointLocation = waypoint.getPosition();

    const marker = new google.maps.Marker({
      position: waypointLocation,
      // @ts-ignore
      stopover: true,
      draggable: false,
      title: 'EV charging stopover'
    });
    this.markerArray.push(marker);
    this.stopoverMarkers.push(marker);
  }

  selectMarkerClosestToDestination(vehicle, lastCheckpoint): any {
    // Selecting the closest marker to destination as long as it is not out of the vehicle capacity range
    const waypoints = [...this.chargingPointsMarkers];

    for (let x = waypoints.length - 1; x >= 0; x--) {
      // @ts-ignore
      if (this.calculateDistance(waypoints[x], lastCheckpoint) > (vehicle.status * vehicle.consumption)){
        waypoints.splice(x, 1);
      }
    }

    for (let x = waypoints.length - 1; x > 0; x--) {
      if (this.calculateDistance(waypoints[x], this.end) > (this.calculateDistance(waypoints[x - 1], this.end))) {
        waypoints.splice(x, 1);
      } else {
        waypoints.splice(x - 1, 1);
      }
    }
    if (waypoints[0].getPosition() === lastCheckpoint.getPosition()){
      const errorMessage = 'Cannot calculate route : no charging point available';
      alert(errorMessage);
      throw Error (errorMessage);
    }
    return waypoints[0];
  }



  setRequest = () => {
    // prepares the request sent to the Directions service
    const stopovers = [];
    for (const item of this.stopoverMarkers) {
      const latLng = item.getPosition();
      const waypoint = {
        location: latLng,
        stopover: true
      };
      stopovers.push(waypoint);
    }
    return {
      origin: this.start.getPosition(),
      destination: this.end.getPosition(),
      waypoints: stopovers,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };
  }

  compareVehicleCapacityToDistance(vehicle, p1): boolean {
    // Checks if the distance to destination is greater than the vehicle capacity
    // @ts-ignore
    if (this.calculateDistance(p1, this.end) > (vehicle.status * vehicle.consumption)){
      return false;
    }
    return true;
  }



  calculateDistance(p1, p2): number {
    // Uses the Google geometry library to calculate distance between two Markers
    const a = p1.getPosition();
    const b = p2.getPosition();

    const distanceString = (google.maps.geometry.spherical.computeDistanceBetween(a, b) / 1000).toFixed(2);
    const distanceNumber = parseFloat(distanceString);
    return distanceNumber;
  }

  showSteps = (directionResult, stepDisplay, map) => {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    // NOT CURRENTLY IMPLEMENTED/USED
    const myRoute = directionResult.routes[0].legs[0];

    for (let i = 0; i < myRoute.steps.length; i++) {
      const marker = (this.markerArray[i] =
        this.markerArray[i] || new google.maps.Marker());
      marker.setMap(map);
      marker.setPosition(myRoute.steps[i].start_location);
      this.attachInstructionText(
        stepDisplay,
        marker,
        myRoute.steps[i].instructions,
        map
      );
    }
  }

  attachInstructionText = (stepDisplay, marker, text, map) => {
    google.maps.event.addListener(marker, 'click', () => {
      // Open an info window when the marker is clicked on, containing the text
      // of the step.
      // NOT CURRENTLY IMPLEMENTED/USED
      stepDisplay.setContent(text);
      stepDisplay.open(map, marker);
    });
  }
}
