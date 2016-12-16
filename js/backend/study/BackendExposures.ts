import { EINPROGRESS } from 'constants';
/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import Sentence from '../../shared/Sentence'
import Exposure from '../../shared/study/Exposure'
import { Event } from '../../shared/metadata/Event'
import { SentenceHistory, SentenceStatusResponse } from '../../shared/metadata/SentenceHistory' 
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'
import Words from '../../shared/Words'
import Exposures from '../../shared/study/Exposures'
import Progress from '../../shared/study/Progress'
import { SentencesByDate } from '../../shared/metadata/SentencesByDate'

const url = 'mongodb://localhost:27017/study';
const COLLECTION_EXPOSURES = 'exposures'
const COLLECTION_PROGRESS = 'progress'

let db: Db

MongoClient.connect(url, function(err, connectedDb) {
    if (err) {
        console.error(err)
    }
    else {
        db = connectedDb
    }
});

class BackendExposures implements Exposures {

    registerExposures(exposures: Exposure[]): Promise<any> {
        if (!db) {
            return Promise.reject('Not connected.')
        }

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_EXPOSURES).insertMany(exposures, {}, (error) => {
                if (error) {
                    console.error(error)
                    reject(error)
                }
                else (
                    resolve()
                )
            })
        })
    }

    getExposuresOfFact(factId: string, userId: number): Promise<Exposure[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor = db.collection(COLLECTION_EXPOSURES)
            .find({
                user: userId,
                fact: factId 
            }).sort({ 
                time: 1
            })

        return this.getExposuresFromCursor(cursor)
    }

    getExposures(userId: number): Promise<Exposure[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor = db.collection(COLLECTION_EXPOSURES)
            .find({
                user: userId
            }).sort({ 
                time: 1
            })

        return this.getExposuresFromCursor(cursor)
    }

    getExposuresFromCursor(cursor: Cursor) {
        return new Promise((resolve, reject) => {
            let result: Exposure[] = []

            cursor
                .forEach((doc) => {
                    let exposure = doc as Exposure
                    exposure.time = new Date(doc.time)

                    result.push(doc);
                }, () => {
                    resolve(result)
                });
        })
    }

    storeProgress(progress: Progress, userId: number) {
        if (!db) {
            return Promise.reject('Not connected')
        }

        return new Promise((resolve, reject) => {
            progress.date = new Date(progress.date.getFullYear(), progress.date.getMonth(), progress.date.getDate())
            progress['user'] = userId

            db.collection(COLLECTION_PROGRESS)
                .updateOne({ user: userId, date: progress.date }, progress, { upsert: true },
                (error, result) => {
                    if (error) {
                        console.error(error)
                        reject(error)
                    }
                    else (
                        resolve()
                    )
                })
        })
    }

    getProgress(userId: number): Promise<Progress[]> {
        if (!db) {
            return Promise.resolve([])
        }

        let cursor = db.collection(COLLECTION_PROGRESS)
            .find({ user: userId })
            .sort({ date: 1 })

        return new Promise((resolve, reject) => {
            let result: Progress[] = []

            cursor
                .forEach((doc) => {
                    result.push(doc as Progress);
                }, () => {
                    resolve(result)
                });
        })
    }
}

export default new BackendExposures()