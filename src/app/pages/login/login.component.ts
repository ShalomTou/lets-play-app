import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Page } from "@nativescript/core/ui/page";
import { User, UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { TNSFancyAlert } from "nativescript-fancyalert";
import {
    getBoolean,
    setBoolean,
    getNumber,
    setNumber,
    getString,
    setString,
    hasKey,
    remove,
    clear,
} from "tns-core-modules/application-settings";
import { TextField } from "@nativescript/core";
import { BehaviorSubject } from "rxjs";

const firebase = require("nativescript-plugin-firebase/app");

@Component({
    selector: "ns-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    public labelPicker: string;
    public user = new User();

    public appName = `LETS PLAY`


    public tmpUser: string
    public tmpPass: string

    // public tmpUser =`amitush27@gmail.com` 
    // public tmpPass = `271992`

    constructor(
        public page: Page,
        public router: Router,
        private userService: UserService) {
        page.actionBarHidden = true;
    }

    ngOnInit(): void { }


    // LOGIN
    loginButton() {
        firebase
            .auth()
            .signInWithEmailAndPassword(this.tmpUser, this.tmpPass)
            .then((res) => {
                console.log(`User ${this.user.email} logged in`);
                console.log('res ', res);
                this.user.user_uid = res.user.uid;
                this.userService.setActiveUser(this.user);
                this.router.navigate(["/tabs"]);
                // TNSFancyAlert.showSuccess(`loged`);
            })
            .catch((err) => {
                console.log("Login error: " + JSON.stringify(err));
                TNSFancyAlert.showError("Check your details");
            });
    }

    // FORGOT PASSWORD
    forgotPassword() {
        firebase
            .auth()
            .sendPasswordResetEmail(this.user.email)
            .then(() => {
                TNSFancyAlert.showSuccess(
                    `Password reset email sent to ${this.user.email}`
                );
                console.log("Password reset email sent");
            })
            .catch((error) => {
                TNSFancyAlert.showError("Enter your email");
                console.log("Error sending password reset email: " + error);
            });
    }

    // CREATE ACCOUNT
    createAccountButton() {
        if (this.user.password == this.user.check_password && this.user.password) {
            firebase
                .auth()
                .createUserWithEmailAndPassword(
                    this.user.email,
                    this.user.password
                )

                .then((res) => {
                    console.log("User created: " + res);
                    this.user.user_uid = res.uid;

                    const usersCollection = firebase
                        .firestore()
                        .collection("users");

                    usersCollection.doc(this.user.user_uid).set(this.user);
                    this.goBackLogin();
                })
                .catch((error) => {
                    console.error("ERROR CREATING USER: " + error);
                });
        } else {
            console.log("ERROR");
            TNSFancyAlert.showError("Enter your details");
        }

        console.log(this.user.email);
    }

    showForgotPass() {
        this.labelPicker = "forgot_password";
    }

    goBackLogin() {
        this.labelPicker = "login";
    }

    showRegister() {
        this.labelPicker = "register";
    }

    // APP SETTINGS
    onNavigatingTo(args) {
        setBoolean("isTurnedOn", true);
        setString("username", "Wolfgang");
        setNumber("locationX", 54.321);

        const isTurnedOn: boolean = getBoolean("isTurnedOn");
        const username: string = getString("username");
        const locationX: number = getNumber("locationX");

        // Will return "No string value" if there is no value for "noSuchKey"
        const someKey: string = getString("noSuchKey", "No string value");

        // Will return false if there is no key with name "noSuchKey"
        let isKeExisting: boolean = hasKey("noSuchKey");
    }

    onClear() {
        // Removing a single entry via its key name
        remove("isTurnedOn");

        // Clearing the whole application-settings for this app
        clear();
    }
}
