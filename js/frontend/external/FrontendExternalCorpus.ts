
import { handleException } from '../xr';
import xr from '../xr';

import { ExternalSentence } from '../../shared/external/ExternalSentence'
import { ExternalCorpus } from '../../shared/external/ExternalCorpus'
import Fact from '../../shared/fact/Fact'
import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'

export default class FrontendExternalCorpus implements ExternalCorpus {
    lang: string

    constructor(public xrArgs: { [name: string]: string}, public corpus: Corpus) {
        this.xrArgs = xrArgs
        this.corpus = corpus
        this.lang = corpus.lang
    }

    getExternalSentences(fact: Fact): Promise<ExternalSentence[]> {
        return xr.get(`/api/${ this.lang }/fact/` + fact.getId() + '/external', {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data as ExternalSentence[]
        })
        .catch(handleException)
    }

    importSentence(sentence: ExternalSentence): Promise<Sentence> {
        return xr.post(`/api/${ this.lang }/sentence/external/` + sentence.source + '/' + sentence.id, {}, this.xrArgs)
        .then((xhr) => {
            let sentence = Sentence.fromJson(xhr.data, this.corpus.phrases, this.corpus.words)

            return this.corpus.sentences.add(sentence)
        })
        .catch(handleException)
    }
}