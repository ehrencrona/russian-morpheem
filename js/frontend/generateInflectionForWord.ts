import xr from 'xr';

import Corpus from '../shared/Corpus';
import Inflection from '../shared/Inflection';
import { GeneratedInflection } from '../shared/Inflections';

import NoSuchWordError from '../shared/NoSuchWordError'

let handleException = (e) => {
    alert('Error while calling server.')
    console.log(e)
}

interface Response {
    inflected: boolean
    isNew: boolean,
    id: string,
    inflection: any,
    stem: string
}

export class NotInflectedError {    
}

export default function generateInflectionForWord(word: string, corpus: Corpus, xrArgs): Promise<GeneratedInflection> {
    if (xrArgs.headers) {
        xrArgs.headers = Object.assign(xrArgs.headers, 
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            })
    }
    
    return xr.post(`/api/${corpus.lang}/inflection-for/${word}`, {}, xrArgs)
        .catch((e) => {
            if (e.status == 404) {
                throw new NoSuchWordError()
            }
            else {
                console.error(e)
                
                throw e
            }
        })
        .then((unparsedResponse) => {
            // caught above
            if (!unparsedResponse) {
                return
            }

            let response: Response = JSON.parse(unparsedResponse.response)
            
            if (!response.inflected) {
                throw new NotInflectedError()
            }
            
            if (response.isNew) {
                let inflection = Inflection.fromJson(response.inflection, corpus.inflections)

                corpus.inflections.add(inflection)
            }

            let inflection = corpus.inflections.get(response.id)
            
            if (!inflection) {
                throw new Error('Could not find inflection from ' + JSON.stringify(response))
            }
            
            let result: GeneratedInflection = {
                inflection: inflection,
                stem: response.stem
            }

            return result
        })
}