import { Event } from './Event'
import { SentencesByDate } from './SentencesByDate'

export interface SentenceHistory {

    getEvents(sentenceId: number): Promise<Event[]>

    setStatus(status: number, sentenceId: number)

    getStatus(sentenceId: number)
    
    getPendingSentences(): Promise<number[]>

    getLatestSentences(): Promise<number[]>

    getMyLatestSentences(): Promise<number[]>

    addComment(comment: string, sentenceId: number)

    getSentencesByDate(): Promise<SentencesByDate>

}