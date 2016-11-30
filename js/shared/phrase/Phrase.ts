import { CASES } from '../inflection/InflectionForms';
import { CursorResult } from '~mongodb/mongodb';

import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhrasePattern from './PhrasePattern'
import PhraseCase from './PhraseCase'
import CaseStudyMatch from './CaseStudyMatch'
import { CaseStudy, JsonFormat as PhrasePatternJsonFormat } from './PhrasePattern'
import { GrammarCase } from '../../shared/inflection/Dimensions'
import { Match } from './Match'
import { MatchContext, DebugPosition } from './MatchContext'

import PhraseMatch from './PhraseMatch'
import Words from '../Words'
import InflectedWord from '../InflectedWord'
import Word from '../Word'
import Corpus from '../Corpus'
import AnyWord from '../AnyWord'

import Inflections from '../inflection/Inflections'
import AbstractFact from '../fact/AbstractFact'

export interface JsonFormat {
    id: string,
    patterns: PhrasePatternJsonFormat[],
    description: string
    en: string
}

export default class Phrase extends AbstractFact {
    description: string = ''
    en: string = ''
    casesCache: GrammarCase[]
    corpus: Corpus

    // whether there are any study words. 
    // there are some facts that are just about how to use a certain case, e.g. genitive to mean possession.
    hasWordFacts: boolean

    constructor(id: string, public patterns: PhrasePattern[]) {
        super(id)

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

        if (context.debug) {
            context.debug('does ' + this.description  
                    + (context.overrideFormCase 
                        ? '@' + CASES[context.overrideFormCase]
                        : '') 
                    + ' match ' + 
                context.words.map(w => w.toText()).join(' ') + '?', 
                    DebugPosition.START)
        }

        let result

        for (let i = 0; i < this.patterns.length && !result; i++) {
            if (context.debug) {
                context.debug(this.patterns[i].toString(), DebugPosition.START)
            }

            let match = this.patterns[i].match(context, onlyFirstWord)

            if (match) {
                match.phrase = this
                result = match
            }

            if (context.debug) {
                context.debug(
                    result 
                        ? `yes! "${ match.words.map(w => w.word.toString()).join(' ') }"` 
                        : 'no.', DebugPosition.END)
            }
        }

        if (context.debug) {
            context.debug(result ? 'yes! ' : 'no.', DebugPosition.END)
        }

        return result
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

    hasCase(grammaticalCase: GrammarCase): boolean {
        return this.getCases().indexOf(grammaticalCase) >= 0
    }

    getCaseFacts() {
        return this.getCases().map(c => this.getCaseFact(c))
    }

    getCaseFact(grammaticalCase: GrammarCase): PhraseCase {
        return new PhraseCase(this, grammaticalCase)
    }

    getWords(): AnyWord[] {
        let allWords: Set<AnyWord>

        this.patterns.forEach((pattern) => {
            let words = pattern.getWords() 

            if (words.size == 0 && 
                pattern.wordMatches.length == 1 && 
                pattern.wordMatches[0] instanceof PhraseMatch) {
                return
            }

            if (!allWords) {
                allWords = words
            }
            else {
                let phraseWords = words

                allWords.forEach((word) => {
                    if (!phraseWords.has(word)) {
                        allWords.delete(word)
                    }
                })
            }
        })

        return allWords ? Array.from(allWords) : []
    }

    getCases(): GrammarCase[] {
        if (!this.casesCache) {
            let phrase = this

            let allCases: Set<GrammarCase>

            phrase.patterns.forEach((pattern) => {
                let patternCases = pattern.getAnyCase()

                if (patternCases.size == 0 && 
                    pattern.wordMatches.length == 1 && 
                    pattern.wordMatches[0] instanceof PhraseMatch) {
                    return
                }

                if (!allCases) {
                    allCases = patternCases
                }
                else {
                    allCases.forEach((grammaticalCase) => {
                        if (!patternCases.has(grammaticalCase)) {
                            allCases.delete(grammaticalCase)
                        }
                    })
                }
            })

            if (allCases) {
                allCases.delete(GrammarCase.CONTEXT)
            }

            this.casesCache = allCases ? Array.from(allCases) : [] 
        }

        return this.casesCache
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