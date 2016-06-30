/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'

import Words from '../../shared/Words'
import Fact from '../../shared/fact/Fact'

import { ExternalSentence } from '../../shared/external/ExternalSentence'

const url = 'mongodb://localhost:27017/external-corpus';
const COLLECTION = 'sentences'

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

export function storeSentence(sentence: ExternalSentence) {

    return new Promise((resolve, reject) => {
        db.collection(COLLECTION).updateOne(
            { 
                source: sentence.source,
                id: sentence.id
            }, 
            sentence, 
            { upsert: true })
            .then(() => resolve())
            .catch(() => reject())
    })
    
}

export function getExternalSentence(id: number, source: string) {
    return new Promise((resolve, reject) => 
        db.collection(COLLECTION).findOne(
            { 
                // todo: resolve if this is a number or a string
                id: id.toString(),
                source: source
            })
            .then((doc) => {
                resolve(doc as ExternalSentence)
            })
            .catch((e) => reject(e)))
}

export function getSentencesForFact(fact: Fact) {
    let cursor = db.collection(COLLECTION).find(
        { 
            facts: fact.getId()
        })

    return new Promise((resolve, reject) => {
        let sentences: ExternalSentence[] = []

        cursor
            .limit(100)
            .forEach((doc) => {
                sentences.push(doc as ExternalSentence);
            }, () => {
                resolve(sentences)
            });
    })
}

