/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import { PhraseHistory } from '../../shared/metadata/PhraseHistory' 
import { PhraseStatus, STATUS_CLOSED, STATUS_OPEN } from '../../shared/metadata/PhraseStatus'


const url = 'mongodb://localhost:27017/metadata';
const COLLECTION_METADATA = 'phrase-metadata'

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

export default class BackendPhraseHistory implements PhraseHistory {

    constructor() {
    }

    setStatus(status: PhraseStatus, phraseId: string) {
        if (!db) {
            console.error(`Could not set status of ${phraseId} to ${status} since Mongo connection failed.`)
            return
        }

        status.phrase = phraseId

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA).updateOne({ phrase: phraseId }, { $set: status }, { upsert: true },
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

    getStatus(phraseId: string): Promise<PhraseStatus> {
        if (!db) {
            return Promise.resolve(null)
        }

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA)
                .findOne( { phrase: phraseId } )
                .then((doc) => {
                    if (!doc) {
                        return resolve({ status: STATUS_OPEN, notes: '' })
                    }

                    delete doc._id

                    resolve(doc as PhraseStatus)
                })
                .catch((e) => reject(e))
        })
    }

    getOpenPhrases(): Promise<string[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor =
            db.collection(COLLECTION_METADATA)
                .find( { 
                    status: STATUS_OPEN 
                } )

        return new Promise((resolve, reject) => {
            let ids: string[] = []

            cursor
                .limit(100)
                .forEach((doc) => {
                    ids.push((doc as PhraseStatus).phrase);
                }, () => {
                    resolve(ids)
                });
        })
    }

}
