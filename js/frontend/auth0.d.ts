interface AuthHash {
    id_token: string
    error: boolean
}

declare class Auth0Lock {
    constructor(foo: string, bar: string)

    on(event: string, callback: (authResult) => void)

    getUserInfo(accessToken: string, callback: (error, profile) => void)
    
    show() 
}
