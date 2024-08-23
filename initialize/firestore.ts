import {Filter, Firestore} from "@google-cloud/firestore";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {Company, User, View} from "../auth/passport/auth.model";
import {map, Observable} from "rxjs";


export const firestoreDB = new Firestore({databaseId: 'static'});

export function getUserByEmail(email: string): Observable<User | undefined> {
    return fromPromise(firestoreDB.collection("user").where(Filter.where('email', '==', email)).get()).pipe(
        map(qs => {
            if (qs.docs.length==0)
                return undefined;
            return qs.docs[0].data() as User
        })
    )
}

export function getUserViews(user: User) {
    return fromPromise(
        firestoreDB.collection("view").where(Filter.where('companyUID', '==', user.companyUID)).get()).pipe(
        (dd) => {
            return dd
        }
    )
}

export function getCompanyViews(uid: string): Observable<Array<View>> {
    const viewPath = `company/${uid}/views`
    return fromPromise(
        firestoreDB.collection(viewPath).get()).pipe(map ( qs => {
            return qs.docs.map( d => {
                return d.data() as View
            })
        })
    )
}

export function getCompanyByUID(uid: string): Observable<Company> {
    const docPath = `company/${uid}`
    return fromPromise(firestoreDB.doc(docPath).get()).pipe( map(d => {
        return d.data() as Company
    }))
}
