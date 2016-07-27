import xr from 'xr'

let xrArgs: { [arg: string] : string }

export default function googleTranslate(text) {

    if (!xrArgs) {
        throw new Error('xrArgs not set.')
    }

    return xr.get('/api/translate', { text: text }, xrArgs)
        .then(function (result) {
            if (result.error || !result.data) {
                throw new Error('Google translate of "' + text +
                    '" failed: ' + JSON.stringify(result))
            }

            if (result.data) {
                return result.data.translation
            }
            else {
                throw new Error('Google translate of "' + text +
                    '" returned no translations: ' + JSON.stringify(result.data))
            }
        })

}

export function setXrArgs(newXrArgs: { [arg: string] : string }) {
    xrArgs = newXrArgs
}