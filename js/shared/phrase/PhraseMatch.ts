
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
            matchPosition: number): number {
        let childContext = Object.assign({}, context)
        childContext.words = context.words.slice(wordPosition)

        childContext.overrideFormCase = 
            (this.overrideFormCase == GrammaticalCase.NOM && context.overrideFormCase ?
                context.overrideFormCase :
                this.overrideFormCase)

        childContext.study = null

        let m = this.phrase.match(childContext, true)

        if (m) {
            if (this.tag && !m.words.find(w => {
                let tags = this.corpus.facts.getTagsOfFact(w.word.getWordFact())

                return tags.indexOf(this.tag) >= 0
            })) {
                return 0
            }

            return m.words.length
        }
        else {
            return 0
        }
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus
        this.phrase = corpus.phrases.get(this.phraseId)

        if (!this.phrase) {
            throw new Error(`Unknown phrase ${this.phraseId}`)
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
        return 'phrase:' + this.phraseId + 
            (this.overrideFormCase ? '@' + CASES[this.overrideFormCase] : '') 
    }
}

export default PhraseMatch
