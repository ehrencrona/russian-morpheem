/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, Db } from 'mongodb'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'

const url = 'mongodb://localhost:27017/metadata';

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

export function recordEdit(sentence: Sentence, author: string) {
    let pending = eventsPending[sentence.id]
    
    if (pending && pending.event == 'edit') {
        eventsPending[sentence.id].text = sentence.toString()
    }
    else {
        recordEvent('edit', sentence, author)
    }
}

export function recordCreate(sentence: Sentence, author: string) {
    recordEvent('create', sentence, author)
}

function recordEvent(type: string, sentence: Sentence, author: string) {
    if (!db) {
        return
    }

    let event = {
        sentence: sentence.id,
        date: new Date(),
        event: 'edit',
        author: author,
        text: sentence.toString()
    }

    eventsPending[sentence.id] = event

    setTimeout(() => {
        db.collection('events').insertOne(eventsPending[sentence.id])

        delete eventsPending[sentence.id]
    }, 10000)
}

export function getEvents(sentenceId: number) {
    var cursor = db.collection('events').find( { "sentence": sentenceId } );

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