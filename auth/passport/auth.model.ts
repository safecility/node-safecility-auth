
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
    CompanyUID: string
    Views: Array<View>
}

export interface User {
    Email: string
    CompanyUID: string
    Roles: Array<string>
    Views?: Array<string>
    AuthViews: Array<View>
}

export function UserViews(user: User, company: Company): View[] {
    if (!user.Views) {
        user.Views = company.Views.map( v => v.ViewUID);
    }

    return company.Views.reduce( (p, cv): Array<View> => {
        if (!cv.Active)
            return p;
        if (!cv.Roles) {
            user.Views?.forEach( uv => {
                if (uv === cv.ViewUID) {
                    p.push(sanitizeView(cv));
                    return;
                }
            })
            return p;
        }

        cv.Roles.forEach( cr => {
            user.Roles?.forEach( ur => {
                if (ur === cr) {
                    user.Views?.forEach( uv => {
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
