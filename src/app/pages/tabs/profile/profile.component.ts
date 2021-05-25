import {
    Component,
    NgZone,
    OnInit
} from "@angular/core";
import {
    Slider
} from "tns-core-modules/ui/slider";
import {
    DatePicker
} from "tns-core-modules/ui/date-picker";
import {
    User,
    UserService
} from "../../../services/user.service";
import {
    MultiSelect,
    AShowType
} from "nativescript-multi-select";
import {
    MSOption
} from "nativescript-multi-select";
import { EventData } from "tns-core-modules/ui/core/view";
import { ListPicker } from "tns-core-modules/ui/list-picker";
const firebase = require("nativescript-plugin-firebase/app");

@Component({
    selector: "ns-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
    user = firebase.auth().currentUser;
    currentUser = new User();
    private _MSelect: MultiSelect;
    private predefinedItems: Array < any > = [];
    public selectedItems: Array < any > = [];
    public userInterests: Array < any > = [];
    public userInterestsDocIds: Array < any > = [];

    currentUserId: string;
    // Adding label picker to be able to edit
    public labelPicker: string = "default";

    public birthdatePicker = false;
    minDate: Date = new Date(1975, 0, 29);
    maxDate: Date = new Date(2045, 4, 12);
    public datePicker;
    public genders:Array<string>= [`Male`,`Female`,`None`]

    public distance = 0;

    public usersCollection = firebase.firestore().collection("users");
    public loggedinUser = this.usersCollection.doc(this.user.uid);

    constructor(private userService: UserService, private zone: NgZone) {
        this._MSelect = new MultiSelect();
        this.predefinedItems = [];
    }

    public onSelectedIndexChanged(args: EventData) {
        const picker = <ListPicker>args.object;
        console.log(`index: ${picker.selectedIndex}; item" ${this.genders[picker.selectedIndex]}`);
        this.currentUser.user_gender = this.genders[picker.selectedIndex]
        console.log(this.currentUser.user_gender)
    }

    async ngOnInit() {
        this.currentUserId = this.userService.currentUser.value.user_uid;
    }

    async findSportInterests() {
        this.userInterests = await firebase
            .firestore()
            .collection("sport_users")
            .get();
        this.userInterests.forEach((doc: any) => {
            const document = doc.data();
            if (document.user == this.currentUserId) {
                this.userInterestsDocIds.push(doc.id);
                this.predefinedItems.push(document.sport);
            }
        });
    }

    async defineNewSportInterest() {
        this.userInterests.forEach((doc: any) => {
            const document = doc.data();
            if (document.user == this.currentUserId) {
                console.log(document);
                this.predefinedItems.push(document.sport);
            }
        });
    }

    public async onSelectTapped() {
        await this.findSportInterests();
        const options: MSOption = {
            title: "Please Select",
            selectedItems: this.predefinedItems,
            items: [{
                    name: "Basketball",
                    value: "1"
                },
                {
                    name: "Football",
                    value: "2"
                },
                {
                    name: "Running",
                    value: "3"
                },
                {
                    name: "Swimming",
                    value: "4"
                },
            ],
            bindValue: "value",
            displayLabel: "name",
            onConfirm: (selectedItems) => {
                this.zone.run(async () => {
                    this.userInterestsDocIds = [];
                    await this.findSportInterests();
                    this.selectedItems = selectedItems;
                    this.predefinedItems = selectedItems;
                    if (this.userInterestsDocIds.length) {
                        console.log(this.userInterestsDocIds);
                        for (let docId of this.userInterestsDocIds) {
                            firebase
                                .firestore()
                                .collection("sport_users")
                                .doc(docId)
                                .delete();
                        }
                        for (let item of this.selectedItems) {
                            const itemToAdd = {
                                user: this.currentUserId,
                                sport: item,
                            };
                            firebase
                                .firestore()
                                .collection("sport_users")
                                .add(itemToAdd);
                        }
                    }
                    console.log("SELECTED ITEMS => ", selectedItems);
                });
            },
            onItemSelected: (selectedItem) => {
                console.log("SELECTED ITEM => ", selectedItem);
            },
            onCancel: () => {
                console.log("CANCEL");
            },
            android: {
                titleSize: 25,
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
            },
            ios: {
                cancelButtonBgColor: "#252323",
                confirmButtonBgColor: "#70798C",
                cancelButtonTextColor: "#ffffff",
                confirmButtonTextColor: "#ffffff",
                showType: AShowType.TypeBounceIn,
            },
        };

        this._MSelect.show(options);
    }

    // change to EDIT
    editDetails() {
        this.labelPicker = "edit_details";
    }

    defaultDetails() {
        this.labelPicker = "default";
    }

    onLoaded(event) {
        this.loggedinUser.get().then((doc) => {
            if (doc.exists) {
                console.log(`Document data: ${JSON.stringify(doc.data())}`);
                this.currentUser = doc.data();
            } else {
                console.log("No such document!");
            }
        });
    }

    // Distance functions
    onSliderValueChange(args) {
        let slider = < Slider > args.object;
        console.log(`Slider new value ${args.value}`);
        this.distance = args.value;
        this.currentUser.user_distance = this.distance;
    }

    updateDetails() {
        alert(`saving details...`);
        const userToUpdate = firebase.auth().currentUser;
        console.log("user ==> ", userToUpdate);
        const userDocument = firebase
            .firestore()
            .collection("users")
            .doc(this.currentUserId);
        userDocument
            .update({
                user_img: this.currentUser.user_img,
                email: this.currentUser.email,
                password: this.currentUser.password,
                user_birthdate: this.currentUser.user_birthdate,
                user_city: this.currentUser.user_city,
                user_first_name: this.currentUser.user_first_name,
                user_last_name: this.currentUser.user_last_name,
                user_gender: this.currentUser.user_gender,
                user_uid: this.currentUser.user_uid,
                user_username: this.currentUser.user_username,
                user_distance: this.currentUser.user_distance,
                user_status: this.user.uid ? true : false,
            })
            .then(() => {
                console.log(`${this.user.uid} updated`);
                this.updatePass(this.currentUser.password)
            })
            .catch(function (error) {
                alert("An error occured");
                console.log(error)
            });
    }

    updatePass(pass) {
        firebase.auth().updatePassword(pass)
        .then(() => {
            console.log("Password updated")
            this.defaultDetails()
        })
        .catch(error => console.log("Error updating password: " + error));
    }


    // Birthdate functions
    changeBirthdatePicker() {
        this.birthdatePicker = !this.birthdatePicker;
    }

    onDatePickerLoaded(args) {
        this.datePicker = args.object as DatePicker;
        this.user.user_birthdate = this.datePicker;
    }

    onDateChanged(args) {
        console.log("Date New value: " + args.value);
        console.log("Date value: " + args.oldValue);
    }

    onDayChanged(args) {
        console.log("Day New value: " + args.value);
        console.log("Day Old value: " + args.oldValue);
    }

    onMonthChanged(args) {
        console.log("Month New value: " + args.value);
        console.log("Month Old value: " + args.oldValue);
    }

    onYearChanged(args) {
        console.log("Year New value: " + args.value);
        console.log("Year Old value: " + args.oldValue);
    }
}
