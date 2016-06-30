import Corpus from '../../shared/Corpus'
import Facts from '../../shared/fact/Facts'
import Words from '../../shared/Words'
import Sentences from './FrontendSentences'
import Inflections from './FrontendInflections'

export default class FrontendCorpus extends Corpus {

    static fromJson(json): FrontendCorpus {
        let inflections = new Inflections().fromJson(json.inflections)
        let words = Words.fromJson(json.words, inflections) 
        let facts = Facts.fromJson(json.facts, inflections, words)
        let sentences = new Sentences(json.lang)
        
        sentences.fromJson(json.sentences, facts, words)

        return new FrontendCorpus(
            inflections,
            words,
            sentences,
            facts, 
            json.lang)
    }

    setXrArgs(xrArgs: { [header: string]: string }) {
        (this.sentences as Sentences).xrArgs = xrArgs;
        (this.inflections as Inflections).xrArgs = xrArgs
    }

}
