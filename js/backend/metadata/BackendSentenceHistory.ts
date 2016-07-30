/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import Sentence from '../../shared/Sentence'
import Sentences from '../../shared/Sentences'
import { Event } from '../../shared/metadata/Event'
import { SentenceHistory, SentenceStatusResponse } from '../../shared/metadata/SentenceHistory' 
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED, STATUS_DELETED } from '../../shared/metadata/SentenceStatus'
import Words from '../../shared/Words'

import { SentencesByDate } from '../../shared/metadata/SentencesByDate'

const url = 'mongodb://localhost:27017/metadata';
const COLLECTION_METADATA = 'metadata'
const COLLECTION_EVENT = 'event'

let db: Db

MongoClient.connect(url, function(err, connectedDb) {
    if (err) {
        console.error(err)
    }
    else {
        db = connectedDb
    }
});

let eventsPending: {[id: number] : Event}  = {}

export const EVENT_EDIT = 'edit'
export const EVENT_CREATE = 'create'
export const EVENT_DELETE = 'delete'
export const EVENT_COMMENT = 'comment'
export const EVENT_ACCEPT = 'accept'
export const EVENT_IMPORT = 'importExternal'
export const EVENT_TRANSLATE = 'translate'

export default class BackendSentenceHistory implements SentenceHistory {

    constructor(public words: Words) {
        this.words = words
    }

    setStatus(status: SentenceStatus, sentenceId: number) {
        if (!db) {
            console.error(`Could not set status of ${sentenceId} to ${status.status} since Mongo connection failed.`)
            return
        }

        status.sentence = sentenceId

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA).updateOne({ sentence: sentenceId }, status, { upsert: true },
                (error, result) => {
                    if (error) {
                        console.error('While updating status: ', error)

                        reject(error)
                    }
                    else {
                        resolve()
                    }
                })
        })
    }

    getStatus(sentenceId: number): Promise<SentenceStatusResponse> {
        if (!db) {
            return Promise.resolve(null)
        }

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA)
                .findOne( { "sentence": sentenceId } )
                .then((doc) => {
                    if (!doc) {
                        return reject(new Error('Unknown sentence ' + sentenceId + '.'))
                    }

                    delete doc._id

                    resolve({ canAccept: true, status: doc as SentenceStatus })
                })
                .catch((e) => reject(e))
        })
    }

    getPendingSentences(exceptAuthor?: string): Promise<number[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor =
            db.collection(COLLECTION_METADATA)
                .find( { 
                    status: STATUS_SUBMITTED,
                    author: { $ne: exceptAuthor } 
                } )

        return new Promise((resolve, reject) => {
            let ids: number[] = []

            cursor
                .limit(100)
                .forEach((doc) => {
                    ids.push((doc as SentenceStatus).sentence);
                }, () => {
                    resolve(ids)
                });
        })
    }

    markDeletedSentencesAsSuch(sentences: Sentences): Promise<number[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor =
            db.collection(COLLECTION_METADATA)
                .find( { 
                    status: { $ne: STATUS_DELETED },
                } )

        let promises = []

        return new Promise((resolve, reject) => {            
            cursor
                .forEach((doc) => {
                    let sentenceId = (doc as SentenceStatus).sentence
                    
                    if (!sentences.get(sentenceId)) {
                        console.log(sentenceId + ' has been deleted')
                        promises.push(this.setStatus({ status: STATUS_DELETED }, sentenceId))
                    }
                }, () => {
                    Promise.all(promises).then(resolve)
                });
        })
    }

    getEventsByDate(eventType): Promise<SentencesByDate> {
        if (!db) {
            return Promise.resolve({
                values: {},
                days: [],
                authors: []    
            })
        }

        let collection

        if (eventType == EVENT_CREATE) {
            collection = 'sentences_by_date'
        }
        else if (eventType == EVENT_ACCEPT) {
            collection = 'accepts_by_date'
        }
        else if (eventType == EVENT_IMPORT) {
            collection = 'imports_by_date'
        }
        else if (eventType == EVENT_TRANSLATE) {
            collection = 'translates_by_date'
        }
        else {
            throw new Error('Unhandled event type')
        }

        let oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)

        let cursor = db.collection(collection)
            .find({ '_id.date': { $gt: oneWeekAgo } }).sort({ '_id.date': 1, '_id.author': 1 })

        return new Promise((resolve, reject) => {
            let ids: number[] = []

            let byDate = {}
            let authors = {}

            cursor.forEach((doc) => {
                let author = doc._id.author || 'unknown'

                // probably an unmapped user ID
                if (author.length > 12) {
                    return    
                }

                let date = doc._id.date
                let dayNumber = Math.round(date.getTime() / 1000 / 60 / 60 / 24)

                if (!byDate[dayNumber]) {
                    byDate[dayNumber] = {}
                }

                authors[author] = true
                byDate[dayNumber][author] = doc.value
            }, () => {
                let days = Object.keys(byDate).sort()

                let values = days.map((key) => byDate[key])

                resolve({
                    values: values,
                    days: days,
                    authors: Object.keys(authors).sort()    
                })
            });
        })
    }

    recordCreate(sentence: Sentence, author: string) {
        this.recordEvent(EVENT_CREATE, sentence, author, true)
        this.setStatus({ status: STATUS_SUBMITTED, author: sentence.author }, sentence.id)
    }

    recordDelete(sentence: Sentence, author: string) {
        this.recordEvent(EVENT_DELETE, sentence, author, false)
        this.setStatus({ status: STATUS_DELETED }, sentence.id)
    }

    recordComment(comment: string, sentence: Sentence, author: string) {
        this.recordEvent(EVENT_COMMENT, sentence, author, false, comment)
    }

    recordAccept(sentence: Sentence, author: string) {
        this.recordEvent(EVENT_ACCEPT, sentence, author, false)
    }

    recordImport(sentence: Sentence, author: string) {
        this.recordEvent(EVENT_IMPORT, sentence, author, false)
    }

    recordEdit(sentence: Sentence, author: string) {
        let pending = eventsPending[sentence.id]

        if (pending && pending.author == author && (pending.event == EVENT_EDIT || pending.event == EVENT_CREATE)) {
            eventsPending[sentence.id].text = sentence.toUnambiguousString(this.words)
        }
        else {
            this.recordEvent(EVENT_EDIT, sentence, author, true)
        }
    }

    recordTranslate(sentence: Sentence, author: string) {
        this.recordEvent(EVENT_TRANSLATE, sentence, author, false, sentence.en())
    }

    recordEvent(type: string, sentence: Sentence, author: string, delay?: boolean, message?: string) {
        if (!db) {
            console.error('Could not record event since Mongo connection failed.')
            return
        }

        let event: Event = {
            sentence: sentence.id,
            date: new Date(),
            event: type,
            author: author,
            text: message || sentence.toUnambiguousString(this.words),
            notify: []
        }

        eventsPending[sentence.id] = event

        this.getAllAuthorsInvolved(sentence.id)
            .then((authorsInvolved) => {
                event.notify = authorsInvolved.filter((involvedAuthor) => involvedAuthor != author)

                setTimeout(() => {
                        db.collection(COLLECTION_EVENT).insertOne(event)

                        if (eventsPending[sentence.id] === event) {
                            delete eventsPending[sentence.id]
                        }
                    }, 
                    (delay ? 180000 : 0)
                )
            })
    }

    someTimeAgo() {
        return new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    returnAllEvents(cursor: Cursor): Promise<Event[]> {
        return new Promise((resolve, reject) => {
            let events: Event[] = []

            cursor.forEach((doc) => {
                events.push(doc as Event);
            }, () => {
                resolve(events)
            });
        })
    }

    getEventsForSentence(sentenceId: number): Promise<Event[]> {
        if (!db) {
            return Promise.resolve([])
        }

        return this.returnAllEvents(
            db.collection(COLLECTION_EVENT).find( { sentence: sentenceId } ))
    }

    getAllAuthorsInvolved(sentenceId: number) {
        return db.collection(COLLECTION_EVENT).distinct('author', { sentence: sentenceId } )
    }

    getLatestEvents(type?: string, author?: string): Promise<Event[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let query: any = { date: { $gt: this.someTimeAgo() } }

        if (type) {
            query.event = type
        }

        if (author) {
            query.author = author
        }

        return this.returnAllEvents(
            db.collection(COLLECTION_EVENT).find(query)
                .sort({ 'date': -1 })
                .limit(100))
    }

    getNewsfeed(forAuthor: string): Promise<Event[]> {
        if (!db) {
            return Promise.resolve([])
        }

        return this.returnAllEvents(
            db.collection(COLLECTION_EVENT).find( 
                { 
                    notify: forAuthor, 
                    date: { $gt: this.someTimeAgo() } 
                } ).sort({ 'date': -1 }))
    }

    getExistingExternalIds(externalIds: string[]) {
        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA).distinct('externalId', {
                externalId: { $in: externalIds } 
            }, (error, existingIds: string[]) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(existingIds)
                }
            })
        })
    }

}
