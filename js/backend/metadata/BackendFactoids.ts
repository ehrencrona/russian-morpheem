/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import { Factoid, Factoids } from '../../shared/metadata/Factoids'
import Fact from '../../shared/fact/Fact' 

const url = 'mongodb://localhost:27017/factoid';
const COLLECTION_METADATA = 'factoid'

export let db: Db

MongoClient.connect(url, function(err, connectedDb) {
    if (err) {
        console.error(err)
    }
    else {
        db = connectedDb
    }
});

export default class BackendFactoids implements Factoids {
    byId: Factoids[] = []

    constructor() {
        this.getAll().then(all => all.forEach(factoid => this.byId[factoid.fact] = factoid))
    }

    setFactoid(factoid: Factoid, fact: Fact) {
        if (!db) {
            console.error(`Could not store factoid ${fact.getId()} since Mongo connection failed.`)
            return
        }

        if (factoid.relations == null) {
            factoid.relations = []
        }

        factoid.fact = fact.getId()

        this.byId[factoid.fact] = factoid

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA).updateOne({ fact: fact.getId() }, factoid, { upsert: true },
                (error, result) => {
                    if (error) {
                        console.error('While updating factoid: ', error)

                        reject(error)
                    }
                    else {
                        resolve()
                    }
                })
        })
    }

    getAll(): Promise<Factoid[]> {
        if (!db) {
            return Promise.resolve(null)
        }

        let cursor =
            db.collection(COLLECTION_METADATA)
                .find( { } )
                
        return new Promise((resolve, reject) => {
            let result: Factoid[] = []

            cursor
                .forEach((doc) => {
                    result.push(doc as Factoid)
                }, () => {
                    resolve(result)
                })
        })
    }

    getFactoidAsync(fact: Fact): Promise<Factoid> {
        let empty = {
            explanation: '',
            fact: fact.getId(),
            relations: []
        }
        
        if (!db) {
            return Promise.resolve(empty)
        }

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION_METADATA)
                .findOne( { "fact": fact.getId() } )
                .then((doc) => {
                    if (!doc) {
                        return resolve(empty)
                    }

                    delete doc._id

                    let factoid: Factoid = doc as Factoid

                    resolve(factoid)
                })
                .catch((e) => reject(e))
        })
    }

    getFactoid(fact: Fact): Factoid {
        return this.byId[fact.getId()] || {
            explanation: '',
            fact: fact.getId(),
            relations: []
        }
    }
}
