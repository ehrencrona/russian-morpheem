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

xr.get('/api/corpus')
.then((xhr) => {
    var element = document.getElementById('react-root');
    let corpus = Corpus.fromJson(xhr.data)

    corpus.sentences.onChange = (sentence: Sentence) => {
        xr.put('/api/sentence/' + sentence.getId(), sentence.toJson())        
    }

    corpus.sentences.onDelete = (sentence: Sentence) => {
        xr.del('/api/sentence/' + sentence.getId())        
    }

    corpus.sentences.onAdd = (sentence: Sentence) => {
        xr.post('/api/sentence', sentence.toJson())
            .then((res) => {
                corpus.sentences.changeId(sentence.id, res.data.id)
            })
    }
    
    corpus.words.onAdd = (word: Word) => {
        xr.post('/api/word/' + word.jp , {
            inflection: (word instanceof InflectedWord ? word.inflection.getId() : '') })
    }

    corpus.words.onChangeInflection = (word: InflectedWord) => {
        xr.put('/api/word/' + word.jp + '/inflection/' + word.inflection.getId(), {})
    }

    corpus.facts.onMove = (fact: Fact, pos: number) => {
        xr.put(`/api/fact/${pos}/${ fact.getId() }`, {})
    }

    corpus.facts.onAdd = (fact: Fact) => {
        // new words are caught through the words listener
        if (fact instanceof InflectionFact) {
            xr.post(`/api/fact/${ fact.getId() }`, {})
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
