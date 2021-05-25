import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { User, UserService } from "../../../../services/user.service";

const firebase = require("nativescript-plugin-firebase/app");

@Component({
    selector: "ns-chat-user",
    templateUrl: "./chat-user.component.html",
    styleUrls: ["./chat-user.component.css"],
})
export class ChatUserComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private userService: UserService
    ) {}
    message = "";
    destUserName = "";
    currentUser: User;
    currentUserId = null;
    destUserId = null;
    isCollectionExists = false;
    userDestName = "";
    chats = [];
    chats$ = new BehaviorSubject<any>(null);
    unsubscribe1: any;

    docData = {
        from: this.currentUserId,
        to: this.destUserId,
        message: "Hello world!!",
        date: new Date(),
    };

    async ngOnInit() {
        this.userService.currentUser.subscribe((user: User) => {
            this.currentUser = user;
            this.currentUserId = user.user_uid;
        });
        const destinationUser = this.route.snapshot.paramMap.get("id");
        this.destUserId = destinationUser;
        if (this.destUserId) {
            await this.getUserName();
        }
        await this.checkIfDocs();
    }
    async getUserName() {
        const users = this.userService.availableUsers.value;
        const user = users.filter((u) => u.user_uid === this.destUserId);
        this.destUserName = user[0].user_username || user[0].email;
    }

    userName(item: any) {
        const displayName =
            item.from === this.currentUserId
                ? "From Me"
                : "From " + this.destUserName;
        return displayName;
    }

    chat() {
        return;
    }

    subscribeOnChatChanges() {
        if (!this.destUserId) return;
        const docRef = firebase
            .firestore()
            .collection("chats")
            .doc(this.currentUserId)
            .collection(this.destUserId)
            .orderBy("date");

        this.unsubscribe1 = docRef.onSnapshot((snapshot) => {
            console.log(snapshot);
            this.chats = [];
            console.log("start");
            snapshot.forEach((chat) => {
                let ChatData: any = {};
                if (chat.data().from) {
                    ChatData.from = chat.data().from;
                }
                if (chat.data().to) {
                    ChatData.to = chat.data().to;
                }
                if (chat.data().message) {
                    ChatData.message = chat.data().message;
                }
                if (chat.data().date) {
                    ChatData.date = chat.data().date;
                }
                this.chats.push(chat.data());
                this.cdr.detectChanges();
                console.log(this.chats);
            });
            console.log("ended");
        });
    }

    async checkIfDocs() {
        if (!this.destUserId) return;
        const db = firebase.firestore();
        const checkIsDocRef = db
            .collection("chats")
            .doc(this.currentUserId)
            .collection(this.destUserId);

        const isCurrentUserDoc = await checkIsDocRef.get();
        console.log("isCurrentUserDoc ", isCurrentUserDoc._docSnapshots.length);
        if (isCurrentUserDoc._docSnapshots.length === 0) {
            await this.addCollection();
        }

        this.subscribeOnChatChanges();
    }

    async addCollection() {
        const dummyData = {
            test: "test",
        };
        if (!this.destUserId) return;
        const db = firebase.firestore();

        const docRefCurrentUser = await db
            .collection("chats")
            .doc(this.currentUserId)
            .collection(this.destUserId);

        await docRefCurrentUser.add(dummyData).then((data) => {
            console.log("Document successfully written!");
        });
    }

    addMessage() {
        console.log("message sent ", this.message);
        if (this.message === "") return;
        if (!this.destUserId) return;

        const dummyData = {
            from: this.currentUserId,
            to: this.destUserId,
            message: this.message,
            date: new Date(),
        };
        const db = firebase.firestore();

        db.collection("chats")
            .doc(this.currentUserId)
            .collection(this.destUserId)
            .add(dummyData)
            .then(function (data) {
                console.log("Document successfully written!");
            });

        db.collection("chats")
            .doc(this.destUserId)
            .collection(this.currentUserId)
            .add(dummyData)
            .then((data) => {
                console.log("Document successfully written!");
            });
    }

    getMassages() {
        const db = firebase.firestore();

        const docRef = db
            .collection("chats")
            .doc(this.currentUserId)
            .collection(this.destUserId);

        docRef.get(this.docData).then(function (data) {
            console.log("Document successfully written!");
        });
    }
}
