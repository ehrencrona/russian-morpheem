
/// <reference path="../../../typings/redis.d.ts"/>

import { RedisClient } from 'node-redis'
import { createClient } from 'node-redis'
import readCorpus from '../CorpusReader'

import { translateGlosbe } from './glosbe'
import InflectableWord from '../../shared/InflectableWord'
import UnstudiedWord from '../../shared/UnstudiedWord'
import Word from '../../shared/Word'
import { getCorpusDir } from '../CorpusReader'

let client = createClient()

import writeFactFile from '../FactFileWriter'

let corpusDir = getCorpusDir('ru')

const OLD_POS_BY_NEW = {

    n: 'N',
    adj: 'J',
    v: 'V', 
    prep: 'I'

}

interface Translatable {
    setEnglish(en: string)
    getEnglish()
}

function stripPos(str) {
    return str.substr(0, str.length-2)
}


let waitFor: Promise<any> = Promise.resolve()


let i = 0


let throttledGlosbe = (word: string, fromLang: string, toLang: string, dontWait?: boolean) => {
    if (i++ > 10000) {
        return Promise.resolve([])
    }

    waitFor = waitFor.then(() => {
        let result

        let p = new Promise((resolve, reject) => {

            result = translateGlosbe(word, fromLang, toLang)

            result.then((translation) => {
                setTimeout(() => resolve(translation.slice(0, 3)), 5000)
            })

        })

        return p
    })

    return waitFor

}

function getFromGlosbe(wordString: string, word: Translatable) {
    if (word.getEnglish()) {
        return Promise.resolve()
    }

    return throttledGlosbe(wordString, 'ru', 'en')
    .then((translations) => {
console.log('got '+ translations+ ' for ' + word)

        let key = 'ru->en.' + wordString + '-?'

        let en = translations.join(', ')

        word.setEnglish(en)
    })
    .catch((e) => console.error(e.stack))
}

client.on('error', function (err) {
    console.error('Could not connect to redis: ' + err, err.stack)
})

client.on('connect', () => {
    readCorpus('ru', false)
        .then((corpus) => {

            Promise.all(
                corpus.facts.facts.map((fact) => {
                    let promise: Promise<any> = Promise.resolve({})

                    if (fact instanceof InflectableWord) {
                        let word = fact.getDefaultInflection().jp.toLowerCase()

                        let key = 'ru->en.' + word + '-' + OLD_POS_BY_NEW[fact.inflection.pos]

                        promise = new Promise((resolve, reject) => {
                            client.lrange(key, 0, 1,
                                (err, reply) => {

                                    if (!reply.length) {
                                        getFromGlosbe(word, fact)
                                        .then(() => resolve())
                                    }
                                    else {
                                        let en = reply.map((b) => stripPos(b.toString())).join(', ')

                                        fact.setEnglish(en)

                                        resolve()
                                    }
                                })
                        })
                    }
                    else if (fact instanceof UnstudiedWord) {
                        promise = getFromGlosbe(fact.jp, fact)
                    }

                    return promise
                }))
                .then(() => {
                    writeFactFile(corpusDir + '/facts.txt', corpus.facts)
                    .catch((e) => console.error(e.stack))

                    console.log('done')
                })
                .catch((e) => console.error(e.stack))

        })
        .catch((e) => console.error(e.stack))
})