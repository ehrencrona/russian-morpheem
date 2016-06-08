import xr from 'xr';

import { Event } from '../../shared/metadata/Event'

let handleException = (e) => {
    alert('Error getting history.')
    console.log(e)
}

export default class FrontendSentenceHistory {
    constructor(public xrArgs: {}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    getEvents(sentenceId: number): Promise<Event[]> {
        return xr.get(`/api/${ this.lang }/sentence/` + sentenceId + '/events', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as Event[]
        })
        .catch(handleException)
    }
}