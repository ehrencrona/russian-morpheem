
import { handleException } from '../xr';
import xr from '../xr';

import { Event } from '../../shared/metadata/Event'
import { SentenceStatus } from '../../shared/metadata/SentenceStatus'
import { SentencesByDate} from '../../shared/metadata/SentencesByDate'
import { SentenceHistory} from '../../shared/metadata/SentenceHistory'

export default class FrontendSentenceHistory implements SentenceHistory {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
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

    getIdList(url): Promise<number[]> {
        return xr.get(`/api/${ this.lang }/${ url }`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as number[]
        })
        .catch(handleException)
    }

    getEventList(url): Promise<Event[]> {
        return xr.get(`/api/${ this.lang }/${ url }`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as Event[]
        })
        .catch(handleException)
    }

    getPendingSentences() {
        return this.getIdList('sentence/pending')
    }

    getEventsForSentence(sentenceId: number): Promise<Event[]> {
        return xr.get(`/api/${ this.lang }/sentence/` + sentenceId + '/events', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data.map((event) => {
                event.date = new Date(event.date)
                return event
            }) as Event[]
        })
        .catch(handleException)
    }

    getLatestEvents(author?: string, type?: string): Promise<Event[]> {
        return this.getEventList('event/latest' + (author ? '/' + author : '/null') + (type ? '/' + type : '/null'))
    }

    getMyLatestEvents(type?: string): Promise<Event[]> {
        return this.getEventList('event/latest/my/' + type)
    }

    addComment(comment: string, sentenceId: number) {
        return xr.post(`/api/${ this.lang }/sentence/${ sentenceId }/comment`, { text: comment }, this.xrArgs)
        .catch(handleException)
    }

    getSentencesByDate() {
        return xr.get(`/api/${ this.lang }/sentence/by-date`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as SentencesByDate
        })
        .catch(handleException)
    }
}