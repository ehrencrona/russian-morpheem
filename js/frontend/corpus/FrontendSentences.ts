
import Sentences from '../../shared/Sentences'
import Sentence from '../../shared/Sentence'
import Facts from '../../shared/Facts'
import Words from '../../shared/Words'

import { handleException } from '../xr';
import xr from '../xr';

export default class FrontendSentences extends Sentences {
    xrArgs: { [header: string] : string } = {}

    constructor(public lang: string) {
        super()

        this.lang = lang
    }

    add(sentence: Sentence) {
        if (sentence.id == null) {
            super.add(sentence)

            return Promise.resolve(sentence)
        }
        else {
            return xr.post(`/api/${ this.lang }/sentence`, sentence.toJson(), this.xrArgs)
                .then((res) => {
                    sentence.id = res.data.id

                    super.add(sentence)

                    return sentence
                })
                .catch(handleException)
        }
    }

}