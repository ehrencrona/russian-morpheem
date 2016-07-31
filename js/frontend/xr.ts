import xr from 'xr';

const TIMEOUT = 15000

xr.configure({
    xmlHttpRequest: () => {
        let xhr = new XMLHttpRequest()

        xhr.timeout = TIMEOUT

        return xhr
    }
})

interface XrInterface {
    get(
        url: string,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }
    )

    del(
        url: string,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }
    )
    
    post(
        url: string,
        data: any,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }
    )

    put(
        url: string,
        data: any,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }
    )
}


function retryOnce(func: () => Promise<any>) {
    return func().catch((e) => {
        // status code 0 is supposed to mean we're offline but it happens intermittently and retrying usually works.
        if (e.status == 0) {
            console.warn('Give HTTP status 0 in response to HTTP call. Retrying.')

            return func()
        }
        else {
            throw e
        }
    })
}

let result: XrInterface = {
    get: (
        url: string,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }) => {
        return retryOnce(() => xr.get(url, parameters, args))
    },

    del: (
        url: string,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }) => {
        return retryOnce(() => xr.del(url, parameters, args))
    },
    
    post: (
        url: string,
        data: any,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }) => {
        return retryOnce(() => xr.post(url, data, parameters, args))
    },

    put: (
        url: string,
        data: any,
        parameters?:  { [name: string]: string },
        args?: { [name: string]: any }
    ) => {
        return retryOnce(() => xr.put(url, data, parameters, args))
    }
};

export default result

export function handleException(e) {
    let message = 'Cannot reach the server. Status code: ' + e.status
    
    alert(message)

    console.log(e)

    return Promise.reject(message)
}
