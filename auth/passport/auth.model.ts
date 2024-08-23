
export interface Group {
    Roles: Array<string>
}

export interface View {
    ViewUID: string;
    App:     string;
    Active?:  boolean;
    Groups?: Array<Group>
    Roles?: Array<string>
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

export function UserViews(user: User, company: Company): View[] {
    if (!user.views) {
        user.views = company.views.map( v => v.ViewUID);
    }

    return company.views.reduce( (p, cv): Array<View> => {
        if (!cv.Active)
            return p;
        if (!cv.Roles) {
            user.views?.forEach( uv => {
                if (uv === cv.ViewUID) {
                    p.push(sanitizeView(cv));
                    return;
                }
            })
            return p;
        }

        cv.Roles.forEach( cr => {
            user.roles?.forEach( ur => {
                if (ur === cr) {
                    user.views?.forEach( uv => {
                        if (uv === cv.ViewUID) {
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
