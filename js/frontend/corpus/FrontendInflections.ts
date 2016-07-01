import { handleException } from '../xr';
import xr from '../xr';

import Corpus from '../../shared/Corpus';
import Inflection from '../../shared/inflection/Inflection';
import Inflections from '../../shared/inflection/Inflections';
import { GeneratedInflection, NotInflectedError } from '../../shared/inflection/Inflections';

import NoSuchWordError from '../../shared/NoSuchWordError'

interface Response {
    inflected: boolean
    isNew: boolean,
    id: string,
    inflection: any,
    stem: string
}

export default class FrontendInflections extends Inflections {
    xrArgs: { [header: string] : string } = {}

    generateInflectionForWord(word: string, corpus: Corpus): Promise<GeneratedInflection> {
        let headers = this.xrArgs['headers']

        if (headers) {
            this.xrArgs['headers'] = Object.assign(headers, 
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                })
        }

        return xr.post(`/api/${corpus.lang}/inflection-for/${word}`, {}, this.xrArgs)
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
}