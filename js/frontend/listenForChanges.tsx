import Corpus from '../shared/Corpus';
import Sentence from '../shared/Sentence';
import Fact from '../shared/fact/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import InflectionFact from '../shared/inflection/InflectionFact';
import { handleException } from './xr';
import xr from './xr';
import getLanguage from './getLanguage';

const lang = getLanguage()

export default function listenForChanges(corpus: Corpus, xrArgs, onUnauthorized: () => any) {
    if (xrArgs.headers) {
        xrArgs.headers = Object.assign(xrArgs.headers, 
            { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            })
    }
    
    corpus.sentences.onChange = (sentence: Sentence) => {
        xr.put(`/api/${lang}/sentence/` + sentence.getId(), sentence.toJson(), xrArgs)        
            .catch(handleException)
    }

    corpus.sentences.onDelete = (sentence: Sentence) => {
        xr.del(`/api/${lang}/sentence/` + sentence.getId(), xrArgs)        
            .catch(handleException)
    }

    corpus.sentences.onAdd = (sentence: Sentence) => {
    }

    corpus.facts.onTag = (fact: Fact, tag: string) => {
        xr.post(`/api/${lang}/fact/${fact.getId()}/tag/${tag}`, {}, xrArgs)
            .catch(handleException)
    }

    corpus.facts.onUntag = (fact: Fact, tag: string) => {
        xr.del(`/api/${lang}/fact/${fact.getId()}/tag/${tag}`, {}, xrArgs)
            .catch(handleException)
    }

    corpus.words.onAddWord = (word: Word) => {
        xr.post(`/api/${lang}/word/` + word.jp, {}, xrArgs)
            .catch(handleException)
    }

    corpus.words.onAddInflectableWord = (word: InflectableWord) => {
        xr.post(`/api/${lang}/inflected-word/` + word.stem, 
            { inflection: word.inflection.getId() }, xrArgs)
            .catch(handleException)
    }

    corpus.words.onChangeInflection = (word: InflectableWord) => {
        xr.put(`/api/${lang}/word/` + word.getId() + '/inflection/' + word.inflection.getId(), {}, xrArgs)
            .catch(handleException)
    }

    corpus.facts.onMove = (fact: Fact, pos: number) => {
        xr.put(`/api/${lang}/fact/${pos}/${ fact.getId() }`, {}, xrArgs)
            .catch(handleException)
    }

    corpus.facts.onAdd = (fact: Fact) => {
        // new words are caught through the words listener
        if (fact instanceof InflectionFact) {
            xr.post(`/api/${lang}/fact/${ fact.getId() }`, {}, xrArgs)
                .catch(handleException)
        }
    }
}