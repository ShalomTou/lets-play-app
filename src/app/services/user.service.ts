import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class UserService {
    public currentUser = new BehaviorSubject<User>(null);
    public availableUsers = new BehaviorSubject<User[]>(null)
    setActiveUser(user: User) {
        this.currentUser.next(user);
    }

    setAvailableUsers(users: User[]) {
        this.availableUsers.next(users);
    }
}

export class User {
    user_img?: string;
    email?: string;
    password?: string;
    check_password?: string;
    user_birthdate?: Date;
    user_city?: string;
    user_first_name?: string;
    user_last_name?: string;
    user_gender?: string;
    user_uid?: string;
    user_username?: string;
    user_distance?: number;
    user_status?: boolean;
}
