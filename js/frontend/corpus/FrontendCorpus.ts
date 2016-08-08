import Corpus from '../../shared/Corpus'
import Facts from '../../shared/fact/Facts'
import Words from '../../shared/Words'
import Phrases from '../../shared/phrase/Phrases'
import Sentences from './FrontendSentences'
import Inflections from './FrontendInflections'
import { JsonFormat } from '../../shared/Corpus'

export default class FrontendCorpus extends Corpus {

    static fromJson(json: JsonFormat): FrontendCorpus {
        let inflections = new Inflections().fromJson(json.inflections)
        let words = Words.fromJson(json.words, inflections) 
        let phrases = Phrases.fromJson(json.phrases, words, inflections)
        let facts = Facts.fromJson(json.facts, inflections, words, phrases)
        let sentences = new Sentences(json.lang)
        
        sentences.fromJson(json.sentences, phrases, words)

        let corpus = new FrontendCorpus(
            inflections,
            words,
            sentences,
            facts, 
            phrases,
            json.lang)

        phrases.setCorpus(corpus)

        return corpus
    }

    setXrArgs(xrArgs: { [header: string]: string }) {
        (this.sentences as Sentences).xrArgs = xrArgs;
        (this.inflections as Inflections).xrArgs = xrArgs
    }

}
