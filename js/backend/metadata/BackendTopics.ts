/// <reference path="../../../typings/modules/mongodb/index.d.ts" />

import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import { Topic, Topics, SerializedTopic } from '../../shared/metadata/Topics'
import AbstractTopic from '../../shared/metadata/AbstractTopic'
import Fact from '../../shared/fact/Fact' 
import Facts from '../../shared/fact/Facts' 

import { db } from './BackendFactoids'
const COLLECTION = 'topics'

export default class BackendTopics implements Topics {

    constructor(public facts: Facts) {
        this.facts = facts;
    }

    addTopic(id: string): Promise<Topic> {
        return this.setTopic(new BackendTopic({
            id: id,
            name: '',
            description: '',
            facts: []
        }, this.facts))
    }

    setTopic(topic: Topic): Promise<any> {
        if (!db) {
            console.error(`Could not store factoid ${topic.id} since Mongo connection failed.`)
            return
        }

        return new Promise((resolve, reject) => {
            db.collection(COLLECTION).updateOne({ id: topic.id }, topic.serialize(), { upsert: true },
                (error, result) => {
                    if (error) {
                        console.error('While updating topic: ', error)

                        reject(error)
                    }
                    else {
                        resolve()
                    }
                })
        })
    }

    getTopic(id: string): Promise<Topic> {
        return new Promise((resolve, reject) => {
            db.collection(COLLECTION)
                .findOne( { "id": id } )
                .then((doc) => {
                    if (!doc) {
                        return null
                    }

                    delete doc._id

                    let factoid: SerializedTopic = doc as SerializedTopic

                    resolve(new BackendTopic(factoid, this.facts))
                })
                .catch((e) => reject(e))
        })
    }

    getAll(): Promise<Topic[]> {
        if (!db) {
            return Promise.resolve(null)
        }

        let cursor =
            db.collection(COLLECTION)
                .find( { } )
                
        return new Promise((resolve, reject) => {
            let result: Topic[] = []

            cursor
                .forEach((doc) => {
                    result.push(new BackendTopic(doc as SerializedTopic, this.facts))
                }, () => {
                    resolve(result)
                })
        })
    }

    getTopicsOfFact(fact: Fact): Promise<Topic[]> {
        throw new Error('Unsupported in backend.')
    }
}

export function deserialize(serialized: SerializedTopic, facts: Facts) {
    return new BackendTopic(serialized, facts)
}

class BackendTopic extends AbstractTopic {
    constructor(topic: SerializedTopic, facts: Facts) {
        super(topic, facts)
    }
}