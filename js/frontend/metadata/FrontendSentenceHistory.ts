
import { handleException } from '../xr';
import xr from '../xr';

import { Event } from '../../shared/metadata/Event'
import Sentence from '../../shared/Sentence'
import { SentenceStatus } from '../../shared/metadata/SentenceStatus'
import { SentencesByDate}  from '../../shared/metadata/SentencesByDate'
import { SentenceHistory, SentenceStatusResponse } from '../../shared/metadata/SentenceHistory'

export const AUTHOR_ME = 'me'

export default class FrontendSentenceHistory implements SentenceHistory {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    setStatus(status: SentenceStatus, sentenceId: number) {
        return xr.put(`/api/${ this.lang }/sentence/` + sentenceId + '/status', { status: status.status }, this.xrArgs)
        .catch(handleException)
    }

    getStatus(sentenceId: number) {
        return xr.get(`/api/${ this.lang }/sentence/` + sentenceId + '/status', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as SentenceStatusResponse
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
        if (author == AUTHOR_ME) {
            return this.getEventList('event/latest/my/' + type)
        }
        else {
            return this.getEventList('event/latest' + (author ? '/' + author : '/null') + (type ? '/' + type : '/null'))
        }
    }

    getNewsfeed(): Promise<Event[]> {
        return this.getEventList('event/newsfeed')
    }

    recordComment(comment: string, sentence: Sentence, author: string) {
        if (author != AUTHOR_ME) {
            throw new Error('Can only use author "me"')
        }

        return xr.post(`/api/${ this.lang }/sentence/${ sentence.id }/comment`, { text: comment }, this.xrArgs)
        .catch(handleException)
    }

    recordCreate(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordDelete(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordEdit(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordEvent(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordAccept(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordImport(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    recordTranslate(sentence: Sentence, author: string) {
        throw new Error('Unsupported in frontend.')
    }

    getExistingExternalIds(externalIds: string[]): Promise<string[]> {
        throw new Error('Unsupported in frontend.')
    }

    getEventsByDate(eventType: string) {
        return xr.get(`/api/${ this.lang }/event/by-date/${ eventType }`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as SentencesByDate
        })
        .catch(handleException)
    }
}