
import { get } from 'request';

export function translateGlosbe(word: string, sourceLang: string, toLang: string) {
    toLang = toLang.substr(0, 2)
    sourceLang = sourceLang.substr(0, 2)

    if (sourceLang == toLang) {
        console.error('Tried to translate from and to same language (' + sourceLang + ')')

        return Promise.resolve([ word ])
    }

    var wordString = word

    var urlEncodedTerm = encodeURIComponent(wordString)

    var url = 'https://glosbe.com/gapi/translate?from=' +
        sourceLang +
        '&dest=' +
        toLang +
            '&format=json&phrase=' + urlEncodedTerm

    console.log('Calling Glosbe for ' + wordString + ' in ' + toLang + '...')

    return new Promise((resolve, reject) =>
        get(url, { timeout: 7000 },
            function(error, response, body) {
                if (error || response.statusCode != 200) {
                    console.error('Error calling ' + url + ': ' + error)

                    reject(error)
                }
                else {
                    var json

                    try {
                        json = JSON.parse(body)
                    }
                    catch (e) {
                        console.error('Error parsing glosbe result from ' + url + ': ' + body)

                        return reject(new Error('Error parsing glosbe result ' + body))
                    }

                    if (json.result !== 'ok') {
                        var stringified = JSON.stringify(json);
                        
                        console.error('Failed calling Glosbee about "' + wordString + "': " + stringified)

                        return reject(new Error(stringified))
                    }

                    var all = json.tuc.map((tuc) => {
                        var text

                        // this format seems to have been abandoned?!
                        if (tuc.phrase && tuc.phrase.language == toLang) {
                            text = tuc.phrase.text
                        }
                        else if (tuc.meanings && tuc.meanings.length &&
                            tuc.meanings[0].text && tuc.meanings[0].language == toLang) {
                            text = tuc.meanings[0].text
                        }

                        if (text && toLang == 'ru') {
                            text = text.replace(/а́/g, 'а').replace(/е́/g, 'е').replace(/о́/g, 'о').replace(/ю́/g, 'ю').replace(/ы́/g, 'ы').replace(/и́/g, 'и').replace(/у́/g, 'у').replace(/я́/g, 'я').replace(/у́/g, 'у')
                        }

                        if (text == 'OK') {
                            console.error('Found text "OK" in Glosbe call for "' + wordString +
                                '". Body: ' + JSON.stringify(body))
                            text = null
                        }

                        return text
                    })

                    var meanings = all.filter(function(text) { return !!text })

                    if (!meanings.length) {
                        console.warn('Got no meanings from Glosbee for "' + wordString + '" translating from ' +
                            sourceLang + ' to ' + toLang + '. Response was ' + body + ' from ' + url)
                    }

                    resolve(meanings)
                }
            }
    ))
}
