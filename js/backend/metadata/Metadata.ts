/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, Db } from 'mongodb'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

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

export function recordCreate(sentence: Sentence, author: string) {
    recordEvent(EVENT_CREATE, sentence, author, true)
}

export function recordEvent(type: string, sentence: Sentence, author: string, delay?: boolean) {
    if (!db) {
        return
    }

    let event: Event = {
        sentence: sentence.id,
        date: new Date(),
        event: type,
        author: author,
        text: sentence.toString()
    }

    eventsPending[sentence.id] = event

    setTimeout(() => {
        db.collection(COLLECTION_EVENT).insertOne(event)

        delete eventsPending[sentence.id]
    }, (delay ? 10000 : 0))
}

export function getEvents(sentenceId: number) {
    var cursor = db.collection(COLLECTION_EVENT).find( { "sentence": sentenceId } );

    return new Promise((resolve, reject) => {
        let events: Event[] = []

        cursor.forEach((doc) => {
            delete doc._id
            events.push(doc as Event);
        }, () => {
            resolve(events)
        });
    })
}