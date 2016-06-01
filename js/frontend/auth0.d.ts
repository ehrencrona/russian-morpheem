interface AuthHash {
    id_token: string
    error: boolean
}

declare class Auth0Lock {
    constructor(foo: string, bar: string)
    
    parseHash(hash: string): AuthHash
    
    show() 
}