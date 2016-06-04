import Corpus from '../shared/Corpus';
import Sentence from '../shared/Sentence';
import Fact from '../shared/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import InflectionFact from '../shared/InflectionFact';
import xr from 'xr';
import getLanguage from './getLanguage';

let handleException = (e) => {
    alert('Error while saving.')
    console.log(e)
}

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
        xr.post(`/api/${lang}/sentence`, sentence.toJson(), xrArgs)
            .then((res) => {
                corpus.sentences.changeId(sentence.id, res.data.id)
            })
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