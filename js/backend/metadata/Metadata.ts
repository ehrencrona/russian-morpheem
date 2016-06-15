/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db } from 'mongodb'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

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

const EVENT_EDIT = 'edit'
const EVENT_CREATE = 'create'
const EVENT_DELETE = 'delete'
const EVENT_COMMENT = 'comment'

export function recordEdit(sentence: Sentence, author: string) {
    let pending = eventsPending[sentence.id]
    
    if (pending && (pending.event == EVENT_EDIT || pending.event == EVENT_CREATE)) {
        eventsPending[sentence.id].text = sentence.toString()
    }
    else {
        recordEvent(EVENT_EDIT, sentence, author, true)
    }
}

export function setStatus(status: number, sentenceId: number, author?: string) {
    if (!db) {
        console.error(`Could not set status of ${sentenceId} to ${status} since Mongo connection failed.`)
        return
    }

    let sentenceStatus: SentenceStatus = {
        status: status,
        sentence: sentenceId
    }

    if (author) {
        sentenceStatus.author = author
    }

    db.collection(COLLECTION_METADATA).updateOne({ sentence: sentenceId }, sentenceStatus, { upsert: true })
}

export function getStatus(sentenceId: number): Promise<SentenceStatus> {
    if (!db) {
        return Promise.resolve(null)
    }

    return new Promise((resolve, reject) => {
        db.collection(COLLECTION_METADATA)
            .findOne( { "sentence": sentenceId } )
            .then((doc) => {
                if (doc) {
                    delete doc._id
                }
                
                resolve(doc as SentenceStatus)
            })
            .catch((e) => reject(e))
    })
}

export function getPending(exceptAuthor: string): Promise<number[]> {
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

export function getSentencesByDate(): Promise<SentencesByDate> {
    if (!db) {
        return Promise.resolve({
            values: {},
            days: [],
            authors: []    
        })
    }

    let cursor = db.collection('sentences_by_date')
        .find({ '_id.date': { $gt: new Date(116, 6, 1) } }).sort({ '_id.date': 1, '_id.author': 1 })

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

export function recordCreate(sentence: Sentence, author: string) {
    recordEvent(EVENT_CREATE, sentence, author, true)
}

export function recordDelete(sentence: Sentence, author: string) {
    recordEvent(EVENT_DELETE, sentence, author, false)
}

export function recordComment(comment: string, sentence: Sentence, author: string) {
    recordEvent(EVENT_COMMENT, sentence, author, false, comment)
}

export function recordEvent(type: string, sentence: Sentence, author: string, delay?: boolean, message?: string) {
    if (!db) {
        console.error('Could not record event since Mongo connection failed.')
        return
    }

    let event: Event = {
        sentence: sentence.id,
        date: new Date(),
        event: type,
        author: author,
        text: message || sentence.toString()
    }

    eventsPending[sentence.id] = event

    setTimeout(() => {
        db.collection(COLLECTION_EVENT).insertOne(event)

        delete eventsPending[sentence.id]
    }, (delay ? 180000 : 0))
}

function oneDayAgo() {
    return new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
}

export function getEvents(sentenceId: number): Promise<Event[]> {
    if (!db) {
        return Promise.resolve([])
    }

    var cursor = db.collection(COLLECTION_EVENT).find( { "sentence": sentenceId } );

    return new Promise((resolve, reject) => {
        let events: Event[] = []

        cursor.forEach((doc) => {
            events.push(doc as Event);
        }, () => {
            resolve(events)
        });
    })
}

export function getLatestSentenceIds(author?: string): Promise<number[]> {
    if (!db) {
        return Promise.resolve([])
    }

    let query: any = { date: { $gt: oneDayAgo() }, event: EVENT_CREATE }

    if (author) {
        query.author = author
    }

    return new Promise((resolve, reject) => {
        db.collection(COLLECTION_EVENT).distinct( 'sentence', 
            query,
            (error: MongoError, result: number[]) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(result.reverse().slice(0, 100))
                }
            }
        )
    })
}
