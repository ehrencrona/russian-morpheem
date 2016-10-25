
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhrasePattern from './PhrasePattern'
import PhraseCase from './PhraseCase'
import CaseStudyMatch from './CaseStudyMatch'
import { JsonFormat as PhrasePatternJsonFormat } from './PhrasePattern'
import { GrammaticalCase } from '../../shared/inflection/InflectionForms'
import { CaseStudy } from './PhrasePattern'
import { Match } from './Match'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import InflectedWord from '../InflectedWord'
import Word from '../Word'
import Corpus from '../Corpus'
import MatchContext from './MatchContext'

export interface JsonFormat {
    id: string,
    patterns: PhrasePatternJsonFormat[],
    description: string
    en: string
}

export default class Phrase implements Fact {
    description: string = ''
    en: string = ''
    casesCache: PhraseCase[]
    corpus: Corpus

    // whether there are any study words. 
    // there are some facts that are just about how to use a certain case, e.g. genitive to mean possession.
    hasWordFacts: boolean

    constructor(public id: string, public patterns: PhrasePattern[]) {
        this.id = id
        this.patterns = patterns

        this.hasWordFacts =
            !!this.patterns.find(p => !!p.wordMatches.find((m) => !m.isCaseStudy()))
    }

    static fromString(id: string, str: string, en: string, words: Words, inflections: Inflections) {
        return new Phrase(
            id,
            [ PhrasePattern.fromString(str.trim(), en, words, inflections) ])
    }

    match(context: MatchContext, onlyFirstWord?: boolean): Match {
        if (!this.corpus) {
            throw new Error('setCorpus was never called.')
        }

        for (let i = 0; i < this.patterns.length; i++) {
            let match = this.patterns[i].match(context, onlyFirstWord)

            if (match) {
                return match
            }
        }
    }

    isAutomaticallyAssigned() {
        return this.id.substr(0,5) == 'auto-'
    }

    toString() {
        return this.description
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

    /** When visiting a sentence, the phrase implies knowledge of which cases to use with it, but when 
      * talking about an individual study word, it does not. So this method is used when visiting the 
      * sentence facts.
      */
    visitFactsForSentence(visitor: (Fact) => any) {
        visitor(this)

        this.getCaseFacts().forEach(visitor)
    }

    getDependencies(): Phrase[] {
        let result: Phrase[] = []

        this.patterns.forEach(p => result.concat(p.getDependencies()))

        return result
    }

    hasCase(grammaticalCase: GrammaticalCase): boolean {
        return !!this.patterns.find((pattern) => pattern.hasCase(grammaticalCase))
    }

    getCaseFacts() {
        if (!this.casesCache) {
            this.casesCache = []

            let allCases = {}
            this.patterns.forEach((p) => p.wordMatches.forEach((m) => {
                if (m.isCaseStudy()) {
                    let grammaticalCase = ((m as any) as CaseStudyMatch).getCaseStudied()

                    if (grammaticalCase == GrammaticalCase.CONTEXT) {
                        return
                    }

                    if (!allCases[grammaticalCase]) {
                        allCases[grammaticalCase] = true

                        this.casesCache.push(this.getCaseFact(grammaticalCase))
                    }
                }
            }))
        }

        return this.casesCache
    }

    getCaseFact(grammaticalCase: GrammaticalCase): PhraseCase {
        return new PhraseCase(this, grammaticalCase)
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus

        this.patterns.forEach((p) => p.setCorpus(corpus))
    }

    toJson(): JsonFormat {
        return {
            id: this.id,
            description: this.description,
            en: this.en,
            patterns: this.patterns.map((p) => p.toJson())
        }
    }

    static fromJson(json: JsonFormat, words: Words, inflections: Inflections): Phrase {
        let result = new Phrase(
            json.id,
            json.patterns.map((p: PhrasePatternJsonFormat) => 
                PhrasePattern.fromJson(p, words, inflections))
        )

        result.description = json.description
        result.en = json.en

        return result
    }
}