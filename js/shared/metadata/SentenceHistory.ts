import { Event } from './Event'
import { SentencesByDate } from './SentencesByDate'
import { SentenceStatus } from './SentenceStatus'

interface SentenceStatusResponse {
    canAccept: boolean,
    status: SentenceStatus
}

export interface SentenceHistory {

    setStatus(status: number, sentenceId: number)

    getStatus(sentenceId: number): Promise<SentenceStatusResponse>
    
    getPendingSentences(): Promise<number[]>

    getEventsForSentence(sentenceId: number): Promise<Event[]>

    getLatestEvents(author?: string, type?: string): Promise<Event[]>

    getMyLatestEvents(type?: string): Promise<Event[]>

    addComment(comment: string, sentenceId: number)

    getSentencesByDate(): Promise<SentencesByDate>

    getNewsfeed(): Promise<Event[]>

}