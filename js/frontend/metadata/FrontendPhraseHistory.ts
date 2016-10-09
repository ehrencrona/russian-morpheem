
import { handleException } from '../xr';
import xr from '../xr';

import Phrase from '../../shared/phrase/Phrase'
import { PhraseStatus } from '../../shared/metadata/PhraseStatus'
import { PhraseHistory } from '../../shared/metadata/PhraseHistory'

export const AUTHOR_ME = 'me'

export default class FrontendPhraseHistory implements PhraseHistory {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    setStatus(status: PhraseStatus, phraseId: string) {
        return xr.put(`/api/${ this.lang }/phrase/` + phraseId + '/status', { status: status.status, notes: status.notes }, this.xrArgs)
        .catch(handleException)
    }

    getStatus(phraseId: string): Promise<PhraseStatus> {
        return xr.get(`/api/${ this.lang }/phrase/` + phraseId + '/status', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as PhraseStatus
        })
        .catch(handleException)
    }

    getOpenPhrases(): Promise<string[]> {
        return xr.get(`/api/${ this.lang }/phrase/open`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as string[]
        })
        .catch(handleException)
    }

}