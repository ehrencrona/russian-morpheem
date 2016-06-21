import readCorpus from '../CorpusReader'

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/Fact'
import UnstudiedWord from '../../shared/UnstudiedWord'

import { readFile } from 'fs'
import { storeSentence } from '../external/ExternalCorpus' 
import { ExternalSentence } from '../../shared/external/ExternalSentence' 
import { parseSentenceToWords, ParsedWord } from '../../shared/external/parseSentenceToWords'

const SOURCE = 'tatoeba'

interface TatoebaSentence {
    en: string, 
    ru: string, 
    id: number
}

let found = 0

let unknownCountByWord = {}

function process(ts: TatoebaSentence, corpus: Corpus) {
    let known: UnstudiedWord[] = []
    let unknown: string[] = []

    let sentence: ExternalSentence = {
        text: ts.ru,
        id: ts.id,
        source: SOURCE,
        en: ts.en,
        facts: []
    }

    parseSentenceToWords(sentence, corpus).forEach((parsedWord: ParsedWord) => {
        if (typeof parsedWord == 'string') {
            let text = parsedWord as string

            if (text.substr(0, 4) == 'Мэри' ||
                text.substr(0, 3) == 'Том' ||
                text.substr(0, 4) == 'Джон') {
            }
            else {
                unknown.push(text)

                if (!unknownCountByWord[text]) {
                    unknownCountByWord[text] = 1
                }
                else {
                    unknownCountByWord[text]++ 
                }
            }
        }
        else {
            known = known.concat(parsedWord as UnstudiedWord[])
        }
    })

    if (known.length > 0 && unknown.length <= 2 && unknown.length * 5 < known.length) {
        let factIds: { [ id: string ]: boolean } = {} 

        known.forEach((word) => {

            word.visitFacts((fact) => {
                factIds[fact.getId()] = true
            })
        })

        sentence.facts = Object.keys(factIds)

        storeSentence(sentence)

        found++
    }
}

readCorpus('ru', false)
.then((corpus) => {
    readFile('/projects/morpheem-jp/data/tatoeba-sentences-ru.json', function(error, body) {
        if (error) {
            throw error
        }

        console.log('Read tatoeba.')

        var sentences: TatoebaSentence[] = JSON.parse(body.toString())

        let lastSentence

        sentences.forEach((sentence, i) => {
            if (lastSentence && lastSentence.ru == sentence.ru) {
                return
            }

            lastSentence = sentence

            process(sentence, corpus)

            if (found % 10000 == 0) {
                console.log(found + ' found...')
            }
        })
        
        let lastCount 

        Object.keys(unknownCountByWord).map((key)=> unknownCountByWord[key]).sort().reverse().slice(0, 30).forEach((count) => {
            if (count != lastCount) {
                console.log(count, Object.keys(unknownCountByWord).filter((key) => unknownCountByWord[key] == count))
                lastCount = count
            }
        })

        console.log(found + ' found.')
    })
})