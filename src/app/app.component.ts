import { Component, OnInit } from "@angular/core";
import * as geolocation from "nativescript-geolocation";
// import * as GooglePlaces from 'nativescript-plugin-google-places';
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { UserService } from "./services/user.service";
const firebase = require("nativescript-plugin-firebase");


@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html",
})

export class AppComponent implements OnInit {
    userCollection = [];

    constructor(private userService: UserService) { }
    ngOnInit(): void {
        geolocation.enableLocationRequest();

        firebase.init({}).then(() => {
            console.log("firebase.init done");
        },
            error => {
                console.log(`firebase.init error: ${error}`);
            }
        );
    }

    async getUsers() {
        let usersCol = [];
        const usersCollection = await firebase
            .firestore()
            .collection("users")
            .get();
        usersCollection.forEach((doc: any) => {
            const document = doc.data();
            usersCol.push(document);
        });
        this.userCollection = usersCol;
        this.userService.setAvailableUsers(usersCol);
    }
}
