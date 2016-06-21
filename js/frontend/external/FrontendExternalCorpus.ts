
import { handleException } from '../xr';
import xr from '../xr';

import { ExternalSentence } from '../../shared/external/ExternalSentence'
import Fact from '../../shared/Fact'

export default class FrontendExternalCorpus {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    getExternalSentences(fact: Fact) {
        return xr.get(`/api/${ this.lang }/fact/` + fact.getId() + '/external', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as ExternalSentence[]
        })
        .catch(handleException)
    }
}