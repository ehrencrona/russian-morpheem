import { Event } from './Event'

export interface SentenceHistory {
    getEvents(sentenceId: number): Promise<Event[]>
}