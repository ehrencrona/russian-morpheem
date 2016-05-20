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

let React = { createElement: createElement }

let lang = 'ru'

if (localStorage.getItem('lang')) {
    lang = localStorage.getItem('lang')
}

if (document.location.hostname.indexOf('latin') > 0) {
    lang = 'lat'
}

xr.get(`/api/${lang}/corpus`)
.then((xhr) => {
    var element = document.getElementById('react-root');
    let corpus = Corpus.fromJson(xhr.data)

    corpus.sentences.onChange = (sentence: Sentence) => {
        xr.put(`/api/${lang}/sentence/` + sentence.getId(), sentence.toJson())        
    }

    corpus.sentences.onDelete = (sentence: Sentence) => {
        xr.del(`/api/${lang}/sentence/` + sentence.getId())        
    }

    corpus.sentences.onAdd = (sentence: Sentence) => {
        xr.post(`/api/${lang}/sentence`, sentence.toJson())
            .then((res) => {
                corpus.sentences.changeId(sentence.id, res.data.id)
            })
    }
    
    corpus.words.onAdd = (word: Word) => {
        xr.post(`/api/${lang}/word/` + word.jp , {
            inflection: (word instanceof InflectedWord ? word.inflection.getId() : '') })
    }

    corpus.words.onChangeInflection = (word: InflectedWord) => {
        xr.put(`/api/${lang}/word/` + word.jp + '/inflection/' + word.inflection.getId(), {})
    }

    corpus.facts.onMove = (fact: Fact, pos: number) => {
        xr.put(`/api/${lang}/fact/${pos}/${ fact.getId() }`, {})
    }

    corpus.facts.onAdd = (fact: Fact) => {
        // new words are caught through the words listener
        if (fact instanceof InflectionFact) {
            xr.post(`/api/${lang}/fact/${ fact.getId() }`, {})
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
