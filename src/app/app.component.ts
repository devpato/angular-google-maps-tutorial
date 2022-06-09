import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { DownloadService } from "./utils/file.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit {


  @ViewChild("mapContainer", { static: false }) gmap: ElementRef;
  map: google.maps.Map;
  mapOptions: google.maps.MapOptions;
  coordinates: google.maps.LatLng;
  lat = 40.73061;
  lng = -73.935242;
  positionSubject = new Subject<{lat: number, lng: number}>();
  hide = true;

  marker: google.maps.Marker;

  constructor(private downloadService: DownloadService) {}

  ngAfterViewInit(): void {
    this.mapInitializer();
    this.positionSubject.subscribe({
      complete: () => console.log(''),
      error:() => console.log(''),
      next: () => this.mapInitializer()}
    );
  }

  mapInitializer(): void {
    this.findCurrentLocation();
    //Coordinates to set the center of the map
    let coordinates = new google.maps.LatLng(this.lat, this.lng);

    let mapOptions: google.maps.MapOptions = {
      center: coordinates,
      zoom: 17,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
    };

    this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);

    const icon = {
      url: "/assets/img/pin-cmr.png", // url
      scaledSize: new google.maps.Size(30, 40), // scaled size
    };

    this.marker = new google.maps.Marker({
      position: coordinates,
      map: this.map,
      title: "position de base",
      icon: icon
      //icon: 'https://map.what3words.com/map/marker.png'
    });

    // //Adding default marker to map
    this.marker.setMap(this.map);
  }

  findCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (position) {
          console.log("Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude);
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.positionSubject.next({lat: this.lat, lng: this.lng})
        }
      },
        (error) => console.log(error));
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  generateMap(): void {
    this.hide = false;
    //URL of Google Static Maps.
    var staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDuqwm4XHdzpFZnog40J_e3JKirsA83pi4";

    //Set the Google Map Center.
    staticMapUrl += "&center=" + this.lat + "," + this.lng;

    //Set the Google Map Size.
    staticMapUrl += "&size=600x600";

    //Set the Google Map Zoom.
    staticMapUrl += "&zoom=" + this.map.getZoom();

    //Set the Google Map Type.
    staticMapUrl += "&maptype=" + this.map.getMapTypeId();

    //Loop and add Markers.
    staticMapUrl += "&markers=icon:"+ this.marker.getIcon()+ "|" + this.lat + "," + this.lng;

    const current = new Date();

    this.downloadService
      .download(staticMapUrl)
      .subscribe(blob => {
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = 'map_'+ current.getTime()+'.png';
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.hide = true;
      })
 }
}
