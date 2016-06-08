import xr from 'xr';

import { Event } from '../../shared/metadata/Event'
import { SentenceStatus } from '../../shared/metadata/SentenceStatus'

let handleException = (e) => {
    alert('Error getting sentence metadata.')
    console.log(e)
}

export default class FrontendSentenceHistory {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
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

    setStatus(status: number, sentenceId: number) {
        return xr.put(`/api/${ this.lang }/sentence/` + sentenceId + '/status', { status: status }, this.xrArgs)
        .catch(handleException)
    }

    getStatus(sentenceId: number) {
        return xr.get(`/api/${ this.lang }/sentence/` + sentenceId + '/status', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as SentenceStatus
        })
        .catch(handleException)
    }

    getPending() {
        return xr.get(`/api/${ this.lang }/pending-sentences`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as number[]
        })
        .catch(handleException)
    }
}