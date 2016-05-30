/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import Corpus from '../shared/Corpus';
import Sentence from '../shared/Sentence';
import Fact from '../shared/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import InflectionFact from '../shared/InflectionFact';

import 'drag-drop-webkit-mobile';
import xr from 'xr';
import TabSet from './TabSetComponent';
import {render} from 'react-dom';
import {createElement} from 'react';
import getLanguage from './getLanguage';

let React = { createElement: createElement }

let lang = getLanguage()

let handleException = (e) => {
    alert('Error while saving.')
    console.log(e)
}

xr.get(`/api/${lang}/corpus`)
.then((xhr) => {
    var element = document.getElementById('react-root');
    let corpus = Corpus.fromJson(xhr.data)

    corpus.sentences.onChange = (sentence: Sentence) => {
        xr.put(`/api/${lang}/sentence/` + sentence.getId(), sentence.toJson())        
            .catch(handleException)
    }

    corpus.sentences.onDelete = (sentence: Sentence) => {
        xr.del(`/api/${lang}/sentence/` + sentence.getId())        
            .catch(handleException)
    }

    corpus.sentences.onAdd = (sentence: Sentence) => {
        xr.post(`/api/${lang}/sentence`, sentence.toJson())
            .then((res) => {
                corpus.sentences.changeId(sentence.id, res.data.id)
            })
            .catch(handleException)
    }
    
    corpus.words.onAdd = (word: Word) => {
        xr.post(`/api/${lang}/word/` + word.jp , {
            inflection: (word instanceof InflectedWord ? word.inflection.getId() : '') })
            .catch(handleException)
    }

    corpus.words.onChangeInflection = (word: InflectedWord) => {
        xr.put(`/api/${lang}/word/` + word.getId() + '/inflection/' + word.inflection.getId(), {})
            .catch(handleException)
    }

    corpus.facts.onMove = (fact: Fact, pos: number) => {
        xr.put(`/api/${lang}/fact/${pos}/${ fact.getId() }`, {})
            .catch(handleException)
    }

    corpus.facts.onAdd = (fact: Fact) => {
        // new words are caught through the words listener
        if (fact instanceof InflectionFact) {
            xr.post(`/api/${lang}/fact/${ fact.getId() }`, {})
                .catch(handleException)
        }
    }

    if (element) {
        render((
            <TabSet corpus={ corpus } />
            ),
            element
        );
    }
})
