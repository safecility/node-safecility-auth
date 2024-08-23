import {getLogging} from "../../initialize/logging";

const logger = getLogging();

export interface Group {
    roles: Array<string>
}

export interface View {
    viewUID: string;
    app:     string;
    active?:  boolean;
    groups?: Array<Group>
    roles?: Array<string>
}

export interface Company {
    uid: string
    name: string
    views: Array<View>
}

export interface User {
    email: string
    companyUID: string
    roles: Array<string>
    views?: Array<string>
    authViews: Array<View>
}

export function UserViews(user: User, authViews: View[]): View[] {
    if (!authViews) {
        logger.warn(authViews, "we need auth views");
        return [];
    }
    if (!user.views) {
        user.views = authViews.map( v => v.viewUID);
    }

    return authViews.reduce( (p, cv): Array<View> => {
        if (!cv.active)
            return p;
        if (!cv.roles) {
            user.views?.forEach( uv => {
                if (uv === cv.viewUID) {
                    p.push(sanitizeView(cv));
                    return;
                }
            })
            return p;
        }

        cv.roles.forEach( cr => {
            user.roles?.forEach( ur => {
                if (ur === cr) {
                    user.views?.forEach( uv => {
                        if (uv === cv.viewUID) {
                            p.push(sanitizeView(cv));
                            return p;
                        }
                        return p;
                    })
                }
                return p;
            })
        })
        return p
    }, new Array<View>);
}

function sanitizeView(view: View): View {
    // return {
    //     ViewUID: view.ViewUID,
    //     App: view.App,
    // }
    return view
}
