/// <reference path="../../typings/redis.d.ts"/>

import { RedisClient } from 'node-redis'
import NoSuchWordError from '../shared/NoSuchWordError'

interface InflectionInDatabase {
    forms: { [s: string]: string },
    pos: string
}

export default function getInflections(word: string, client: RedisClient): Promise<InflectionInDatabase> {
    return new Promise((resolve, reject) => {
        client.hgetall(word,
            (err, reply) => {
                if (err) {
                    reject(err)
                }
                else {
                    if (!reply.length) {
                        reject(new NoSuchWordError())
                    }
                    
                    let array = reply.map((buf) => buf.toString())
                    
                    let forms: { [s: string]: string } = {}
                    
                    for (let i = 0; i < array.length; i += 2) {
                        forms[array[i]] = array[i+1]
                    }

                    let pos = forms['pos']

                    delete forms['pos']
                    
                    let result: InflectionInDatabase = {
                        forms: forms,
                        pos: pos
                    }

                    resolve(result)
                }
            }
        )
    })
}
