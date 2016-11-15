import { Event } from './Event'
import { SentencesByDate } from './SentencesByDate'
import { SentenceStatus } from './SentenceStatus'
import Sentence from '../Sentence'

export interface SentenceStatusResponse {
    canAccept: boolean,
    status: SentenceStatus
}

export interface SentenceHistory {

    setStatus(status: SentenceStatus, sentenceId: number)

    getStatus(sentenceId: number): Promise<SentenceStatusResponse>
    
    getPendingSentences(exceptAuthor?: string): Promise<number[]>

    getUnrecordedSentences(): Promise<number[]>

    getEventsForSentence(sentenceId: number): Promise<Event[]>

    getLatestEvents(author?: string, type?: string): Promise<Event[]>

    recordComment(comment: string, sentence: Sentence, author: string)

    recordCreate(sentence: Sentence, author: string)

    recordDelete(sentence: Sentence, author: string)

    recordEdit(sentence: Sentence, author: string)

    recordAccept(sentence: Sentence, author: string)

    recordImport(sentence: Sentence, author: string)

    recordTranslate(sentence: Sentence, author: string)

    recordRecord(sentence: Sentence, author: string)

    getEventsByDate(eventType: string): Promise<SentencesByDate>

    getNewsfeed(author?: string): Promise<Event[]>

    getExistingExternalIds(externalIds: string[]): Promise<string[]>

}

const MSG = 'Failure loading corpus'

export class EmptySentenceHistory {
    setStatus(status: SentenceStatus, sentenceId: number) {
        throw new Error(MSG)
    }

    getStatus(sentenceId: number): Promise<SentenceStatusResponse> {
        return Promise.reject(new Error(MSG))
    }
    
    getPendingSentences(exceptAuthor?: string): Promise<number[]> {
        return Promise.reject(new Error(MSG))
    }

    getUnrecordedSentences(): Promise<number[]> {
        return Promise.reject(new Error(MSG))
    }

    getEventsForSentence(sentenceId: number): Promise<Event[]> {
        return Promise.reject(new Error(MSG))
    }

    getLatestEvents(author?: string, type?: string): Promise<Event[]> {
        return Promise.reject(new Error(MSG))
    }

    recordComment(comment: string, sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordCreate(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordDelete(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordEdit(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordAccept(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordImport(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordTranslate(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    recordRecord(sentence: Sentence, author: string) {
        throw new Error(MSG)
    }

    getEventsByDate(eventType: string): Promise<SentencesByDate> {
        return Promise.reject(new Error(MSG))
    }

    getNewsfeed(author?: string): Promise<Event[]> {
        return Promise.reject(new Error(MSG))
    }

    getExistingExternalIds(externalIds: string[]): Promise<string[]> {
        return Promise.reject(new Error(MSG))
    }

}