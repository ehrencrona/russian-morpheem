
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, CASES } from '../inflection/InflectionForms'
import { GrammarCase } from '../inflection/Dimensions'
import Phrase from './Phrase'
import Corpus from '../../shared/Corpus'
import Facts from '../../shared/fact/Facts'
import Fact from '../../shared/fact/Fact'
import mapFind from '../../shared/mapFind'

import MatchContext from './MatchContext'
import Match from './Match'
import CaseStudyMatch from './CaseStudyMatch'

export class PhraseMatch implements WordMatch, CaseStudyMatch {
    phrase: Phrase
    corpus: Corpus

    constructor(public phraseId: string, public overrideFormCase: GrammarCase, public tag?: string) {
        this.phraseId = phraseId == 'any' ? null : phraseId
        this.overrideFormCase = overrideFormCase
        this.tag = tag
    }

    matches(context: MatchContext, wordPosition: number, matches: WordMatch[], 
            matchPosition: number): number|Match {
        if (!this.phraseId) {
            return this.matchesAny(context, wordPosition, matches, matchPosition)
        }
        else {
            return this.matchesSpecificPhrase(this.phrase, context, wordPosition, matches, matchPosition)
        }
    }

    matchesSpecificPhrase(phrase: Phrase, context: MatchContext, wordPosition: number, matches: WordMatch[], 
            matchPosition: number): number|Match {
        if (context.sentence && !phrase.isAutomaticallyAssigned() &&
            !context.sentence.phrases.find(p => p.id == phrase.id)) {
            return
        }

        let childContext = Object.assign({}, context)
        childContext.words = context.words.slice(wordPosition)

        childContext.overrideFormCase = 
            ((!this.overrideFormCase || this.overrideFormCase == GrammarCase.CONTEXT) && 
                context.overrideFormCase ?
                    context.overrideFormCase :
                    this.overrideFormCase)

        childContext.depth = (context.depth || 0) + 1

        if (childContext.depth > 12) {
            console.warn('Maximum phrase depth reaching. Bailing.')

            return
        }

        let m = phrase.match(childContext, true)

        if (m) {
            if (this.tag) {
                let matchingFacts = this.corpus.facts.getFactIdsWithTag(this.tag)

                if (!m.words.find(w => matchingFacts.has(w.word.getWordFact().getId()))) {
                    return 0
                }
            }

            return m
        }
        else {
            return 0
        }
    }

    matchesAny(context: MatchContext, wordPosition: number, matches: WordMatch[], 
            matchPosition: number): number|Match {
        let corpus = this.corpus
        let sentence = context.sentence

        let result: number|Match
        
        result = mapFind(sentence.phrases, (phrase: Phrase) => {
            let m = corpus.sentences.match(sentence, phrase, corpus.facts, context.debug)

            if (m && m.words[0].index == wordPosition) {
                return m
            }
        })

        if (!result) {
            // we ought to match all auto phrases but in effect this is the only one that's interesting
            let np = corpus.phrases.get('auto-np')

            if (np) {
                result = this.matchesSpecificPhrase(np, context, wordPosition, matches, matchPosition)
            }
        }

        return result
    }

    getInflectionForm() {
        if (this.overrideFormCase) {
            return FORMS[CASES[this.overrideFormCase]]
        }
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus

        if (this.phraseId) {
            this.phrase = corpus.phrases.get(this.phraseId)

            if (!this.phrase) {
                this.phrase = corpus.phrases.get('auto-' + this.phraseId)

                if (!this.phrase) {
                    throw new Error(`Unknown phrase ${this.phraseId}`)
                }
            }
        }
    }

    allowEmptyMatch() {
        return false
    }

    isCaseStudy() {
        return !!this.overrideFormCase
    }

    getCaseStudied() {
        return this.overrideFormCase
    }
    
    toString() {
        return 'phrase:' + (this.phraseId ? this.phraseId : 'any') 
            + (this.overrideFormCase ? '@' + CASES[this.overrideFormCase] : '') 
            + (this.tag ? '#' + this.tag : '') 
    }
}

export default PhraseMatch
