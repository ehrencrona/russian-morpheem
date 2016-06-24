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
    alert('Cannot reach the server. Status code: ' + e.status)

    console.log(e)
}
