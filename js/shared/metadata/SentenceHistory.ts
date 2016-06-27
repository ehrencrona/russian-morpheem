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

    getEventsForSentence(sentenceId: number): Promise<Event[]>

    getLatestEvents(author?: string, type?: string): Promise<Event[]>

    recordComment(comment: string, sentence: Sentence, author: string)

    recordCreate(sentence: Sentence, author: string)

    recordDelete(sentence: Sentence, author: string)

    recordEdit(sentence: Sentence, author: string)

    recordAccept(sentence: Sentence, author: string)

    recordImport(sentence: Sentence, author: string)

    getEventsByDate(eventType: string): Promise<SentencesByDate>

    getNewsfeed(author?: string): Promise<Event[]>

}