
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhraseMatch from './PhraseMatch'
import { CaseStudy, Match } from './PhraseMatch'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import InflectedWord from '../InflectedWord'
import Word from '../Word'

export interface JsonFormat {
    id: string,
    patterns: string[],
    description: string,
    en: string
}

interface EnglishBlock {
    placeholder: boolean,
    en(match: Match): string
    enWithJpForCases(match: Match): string
}

export default class Phrase implements Fact {
    en: string = ''
    description: string = ''

    constructor(public id: string, public patterns: PhraseMatch[]) {
        this.id = id
        this.patterns = patterns
    }

    static fromString(id: string, str: string, words: Words, inflections: Inflections) {
        return new Phrase(
            id,
            str.split(',').map((str) => 
                PhraseMatch.fromString(str.trim(), words, inflections)))
    }

    match(words: Word[], facts: Facts, study?: CaseStudy): Match {
        for (let i = 0; i < this.patterns.length; i++) {
            let match = this.patterns[i].match(words, facts, study)

            if (match) {
                return match
            }
        }
    }

    toString() {
        return this.patterns.map((p) => p.toString()).join(', ')
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }
    
    toJson(): JsonFormat {
        return {
            id: this.id,
            description: this.description,
            patterns: this.patterns.map((p) => p.toString()),
            en: this.en
        }
    }

    getEnglishBlocks(): EnglishBlock[] {

        let split = this.en.match(/(\[[^\]]+\]|[^\[]+)/g)
        let placeholderCount = 0

        let result: EnglishBlock[] = []
        
        if (!split) {
            return result
        }

        split.map((str) => {
            str.split('...').forEach((str) => {
                str = str.trim()

                let en = str

                let placeholder = str[0] == '['
                let placeholderIndex = placeholderCount

                if (placeholder) {
                    en = str.substr(1, str.length-2)

                    placeholderCount++
                }

                result.push({
                    placeholder: placeholder,
                    enWithJpForCases: (match: Match) => {
                        
                        if (placeholder) {
                            let m = match.filter((m) => m.wordMatch.isCaseStudy())[placeholderIndex]

                            if (!m) {
                                console.log('Placeholders didnt match case studies in phrase ' + this.id)

                                return en
                            }

                            let placeholderWord = m.word

                            return (placeholderWord instanceof InflectedWord ? 
                                placeholderWord.word.getDefaultInflection().jp : 
                                placeholderWord.jp)
                        }
                        else {
                            let replace: { [key: string]: Word[]} = {}
        console.log(match)
                            match.forEach((m) => {
                                let mStr = m.wordMatch.toString()
        console.log('mStr', mStr)
                                if (en.indexOf(mStr) >= 0) {
                                    let r = replace[mStr]

                                    if (!r) {
                                        r = []
                                        replace[mStr] = r
                                    }

                                    r.push(m.word)
                                }
                            })

                            Object.keys(replace).forEach((r) => {
        console.log('replace',r,'with', replace[r].map((w) => w.jp).join(' '))

                                en = en.replace(new RegExp(r, 'g'), replace[r].map((w) => 
                                    (w instanceof InflectedWord ? w.word.getDefaultInflection().jp : w.jp)
                                ).join(' '))
                            })

                            return en                                     
                        }

                    },
                    en: (match: Match) => {
                        let replace: { [key: string]: Word[]} = {}
    console.log(match)
                        match.forEach((m) => {
                            let mStr = m.wordMatch.toString()
    console.log('mStr', mStr)
                            if (en.indexOf(mStr) >= 0) {
                                let r = replace[mStr]

                                if (!r) {
                                    r = []
                                    replace[mStr] = r
                                }

                                r.push(m.word)
                            }
                        })

                        Object.keys(replace).forEach((r) => {
    console.log('replace',r,'with', replace[r].map((w) => w.jp).join(' '))

                            en = en.replace(r, replace[r].map((w) => w.getEnglish()).join(' '))
                        })

                        return en                                     
                    } 
                })
            })
        })

        return result
    }

    static fromJson(json: JsonFormat, words: Words, inflections: Inflections): Phrase {
        let result = new Phrase(
            json.id,
            json.patterns.map((str) => 
                PhraseMatch.fromString(str, words, inflections))
        )

        result.en = json.en
        result.description = json.description

        return result
    }
}