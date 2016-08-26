
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, CASES, GrammaticalCase } from '../inflection/InflectionForms'
import Phrase from './Phrase'
import Corpus from '../../shared/Corpus'
import Facts from '../../shared/fact/Facts'
import Fact from '../../shared/fact/Fact'
import MatchContext from './MatchContext'
import Match from './Match'
import CaseStudyMatch from './CaseStudyMatch'

export class PhraseMatch implements WordMatch, CaseStudyMatch {
    phrase: Phrase
    corpus: Corpus

    constructor(public phraseId: string, public overrideFormCase: GrammaticalCase, public tag?: string) {
        this.phraseId = phraseId
        this.overrideFormCase = overrideFormCase
        this.tag = tag
    }

    matches(context: MatchContext, wordPosition: number, matches: WordMatch[], 
            matchPosition: number): number|Match {
        if (context.sentence && !this.phrase.isAutomaticallyAssigned() &&
            !context.sentence.phrases.find(p => p.id == this.phrase.id)) {
            return
        }

        let childContext = Object.assign({}, context)
        childContext.words = context.words.slice(wordPosition)

        childContext.overrideFormCase = 
            (this.overrideFormCase == GrammaticalCase.NOM && context.overrideFormCase ?
                context.overrideFormCase :
                this.overrideFormCase)

        childContext.study = null
        
        childContext.depth = (context.depth || 0) + 1

        if (childContext.depth > 5) {
            console.warn('Maximum phrase deptch reaching. Bailing.')
            return
        }

        let m = this.phrase.match(childContext, true)

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

    setCorpus(corpus: Corpus) {
        this.corpus = corpus
        this.phrase = corpus.phrases.get(this.phraseId)

        if (!this.phrase) {
            this.phrase = corpus.phrases.get('auto-' + this.phraseId)

            if (!this.phrase) {
                throw new Error(`Unknown phrase ${this.phraseId}`)
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
        return 'phrase:' + this.phraseId 
            + (this.overrideFormCase ? '@' + CASES[this.overrideFormCase] : '') 
            + (this.tag ? '#' + this.tag : '') 
    }
}

export default PhraseMatch
