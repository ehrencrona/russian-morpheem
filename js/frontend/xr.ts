import xr from 'xr';

const TIMEOUT = 15000

xr.configure({
    xmlHttpRequest: () => {
        let xhr = new XMLHttpRequest()

        xhr.timeout = TIMEOUT

        return xhr
    }
})

export default xr;

export function handleException(e) {
    let message = 'Cannot reach the server. Status code: ' + e.status
    
    alert(message)

    console.log(e)

    return Promise.reject(message)
}
