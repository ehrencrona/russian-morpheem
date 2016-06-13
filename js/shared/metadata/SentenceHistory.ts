import { Event } from './Event'
import { SentencesByDate } from './SentencesByDate'

export interface SentenceHistory {

    getEvents(sentenceId: number): Promise<Event[]>

    setStatus(status: number, sentenceId: number)

    getStatus(sentenceId: number)
    
    getPending(): Promise<number[]>

    addComment(comment: string, sentenceId: number)

    getSentencesByDate(): Promise<SentencesByDate>

}