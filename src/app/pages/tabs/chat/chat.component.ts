import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { User, UserService } from "../../../services/user.service";

const firebase = require("nativescript-plugin-firebase/app");

@Component({
    selector: "ns-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
    users = [];
    currentUser: User;
    constructor(private userService: UserService) {}
    async ngOnInit() {
        this.userService.currentUser.subscribe((user: User) => {
            this.currentUser = user;
        })
        await this.getUsers();
    }

    onItemTap(event) {
        console.log(event)
    }

    async getUsers() {
        let usersCol = [];
        const usersCollection = await firebase
            .firestore()
            .collection("users")
            .get();

        usersCollection.forEach((doc: any) => {
            const document = doc.data();
            if (document.user_uid !== this.currentUser?.user_uid) {
                usersCol.push(document);
            }
        });

        this.users = usersCol;
        this.userService.setAvailableUsers(this.users);
    }
}
