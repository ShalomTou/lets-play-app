import { Component, OnInit, ViewChild, NgZone } from "@angular/core";
import { registerElement } from "@nativescript/angular/element-registry";
import { MapView, Marker, Position } from "nativescript-google-maps-sdk";
import * as Geolocation from "nativescript-geolocation";
import { UserService } from "../../../services/user.service";

// Important - must register MapView plugin in order to use in Angular templates
registerElement("MapView", () => MapView);
const firebase = require("nativescript-plugin-firebase/app");

@Component({
    selector: "ns-map",
    templateUrl: "./map.component.html",
    styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
    public latitude: number;
    public longitude: number;
    public imageTyped: number;
    private watchId: number;

    zoom = 8;
    minZoom = 0;
    maxZoom = 22;
    bearing = 0;
    tilt = 0;
    padding = [40, 40, 40, 40];
    mapView: MapView;
    usersAvailableByActivity = [];
    userCollection = [];
    currentUserId: string;

    lastCamera: String;

    constructor(private zone: NgZone, private userService: UserService) {
        this.latitude = 0;
        this.longitude = 0;
    }

    ngOnInit() {
        this.currentUserId = this.userService.currentUser.value.user_uid;
    }

    //Map events
    onMapReady(event) {
        this.updateLocation();
        console.log("Map Ready");
        this.mapView = event.object;
        this.mapView.zoom = 20;
        this.addMarkers();
    }

    placeMarker() {
        console.log("Setting a marker...");
        var marker = new Marker();
        marker.position = Position.positionFromLatLng(
            this.latitude,
            this.longitude
        );
        marker.title = "My location";
        marker.snippet = "Israel";
        marker.userData = { index: 1 };
        console.log(marker);
        this.mapView.addMarker(marker);
    }

    onCoordinateTapped(args) {
        console.log(
            "Coordinate Tapped, Lat: " +
                args.position.latitude +
                ", Lon: " +
                args.position.longitude,
            args
        );
    }

    onMarkerEvent(args) {}

    onCameraChanged(args) {
        this.lastCamera = JSON.stringify(args.camera);
    }

    onCameraMove(args) {}

    // GSP
    private getDeviceLocation(): Promise<any> {
        return new Promise((resolve, reject) => {
            Geolocation.enableLocationRequest().then(() => {
                Geolocation.getCurrentLocation({ timeout: 10000 })
                    .then((location) => {
                        resolve(location);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        });
    }

    // Get location
    public updateLocation() {
        this.getDeviceLocation().then(
            (result) => {
                this.latitude = result.latitude;
                this.longitude = result.longitude;
                console.log(`${this.longitude}, ${this.latitude}`);
                this.placeMarker();
                this.addMarkers();
            },
            (error) => {
                console.error(error);
            }
        );
    }

    addMarkers() {
        firebase
            .firestore()
            .collection("sport_places")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                    const document = doc.data();
                    const lat = this.latitude + document.lat;
                    const long = this.longitude + document.long;
                    this.addMapMarkers(
                        document.title,
                        document.snippet,
                        2,
                        lat,
                        long
                    );
                });
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }

    async getUserName(value) {
        const user = await firebase
            .firestore()
            .collection("users")
            .where("user_uid", "==", value)
            .get();

        console.log(user);
        return user.doc.data();
    }

    async getUsersByActivity(args: number) {
        let usersArray = [];
        this.imageTyped = 0;
        await this.getUsers();
        const usersActivity = await firebase
            .firestore()
            .collection("sport_users")
            .get();
        usersActivity.forEach((doc) => console.log(doc.data()));
        usersActivity.forEach((doc: any) => {
            const document = doc.data();
            if (
                document.sport == args &&
                document.user !== this.currentUserId
            ) {
                usersArray.push(document);
            }
        });
        this.usersAvailableByActivity = usersArray;
        this.imageTyped = args;
        if (args == 1) {
            this.addMapMarkers(
                "Basketball stadium",
                "",
                2,
                this.latitude + Math.random() / 10000,
                this.longitude + Math.random() / 10000
            );
        }
        if (args == 2) {
            this.addMapMarkers(
                "Soccer stadium",
                "",
                2,
                this.latitude + Math.random() / 100,
                this.longitude + Math.random() / 1000
            );
        }
        if (args == 3) {
            this.addMapMarkers(
                "Running path",
                "",
                2,
                this.latitude + Math.random() / 10000,
                this.longitude + Math.random() / 1000
            );
        }
        if (args == 4) {
            this.addMapMarkers(
                "Swimming Pool",
                "",
                2,
                this.latitude + Math.random() / 100,
                this.longitude + Math.random() / 100
            );
        }
    }

    async getUsers() {
        let usersCol = [];
        const usersCollection = await firebase
            .firestore()
            .collection("users")
            .get();
        usersCollection.forEach((doc) => console.log(doc.data()));
        usersCollection.forEach((doc: any) => {
            const document = doc.data();
            usersCol.push(document);
        });
        this.userCollection = usersCol;
    }

    getUserNames(value) {
        const user: any = this.userCollection.filter(
            (user) => user.user_uid == value
        );

        return user[0].email;
    }

    removeMarkers() {
        this.mapView.removeAllMarkers();
    }

    // in case that i want to watch over the realtime location
    public startWatchingLocation() {
        this.watchId = Geolocation.watchLocation(
            (location) => {
                if (location) {
                    this.zone.run(() => {
                        this.latitude = location.latitude;
                        this.longitude = location.longitude;
                    });
                }
            },
            (error) => {
                console.log(error);
            },
            { updateDistance: 1, minimumUpdateTime: 1000 }
        );
    }

    // to stop realtime location
    public stopWatchingLocation() {
        if (this.watchId) {
            Geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    addMapMarkers(
        title: string,
        snippet: string,
        index: number,
        lat: number,
        long: number
    ) {
        let marker = new Marker();
        marker.position = Position.positionFromLatLng(lat, long);
        marker.title = title;
        marker.snippet = snippet;
        marker.userData = { index };
        console.log(marker);

        this.mapView.addMarker(marker);
    }
}
