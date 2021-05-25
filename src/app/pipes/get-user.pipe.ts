import { Pipe, PipeTransform } from "@angular/core";
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
const firebase = require("nativescript-plugin-firebase");
@Pipe({ name: "getUser" })
export class GetUserPipe implements PipeTransform {
    transform(value: string): any {
        // const user = firebase.firestore().collection("posts");
        // this.test(value);
        return 2;
    }


}
