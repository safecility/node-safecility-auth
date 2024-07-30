import {Filter, Firestore} from "@google-cloud/firestore";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {User} from "../auth/passport/auth.model";


export const firestoreDB = new Firestore({databaseId: 'static'});

export function getUserByEmail(email: string) {
    return fromPromise(firestoreDB.collection("user").where(Filter.where('Email', '==', email)).get())
}

export function getUserViews(user: User) {
    return fromPromise(
        firestoreDB.collection("view").where(Filter.where('CompanyUID', '==', user.CompanyUID)).get()).pipe(
        (dd) => {
            return dd
        }
    )
}

export function getCompanyByUID(uid: string) {
    return fromPromise(firestoreDB.collection("company").where(Filter.where('CompanyUID', '==', uid)).get())
}
