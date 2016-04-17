/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import Corpus from '../shared/Corpus';
import Sentence from '../shared/Sentence';
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

    corpus.sentences.onAdd = (sentence: Sentence) => {
        xr.post('/api/sentence', sentence.toJson())
            .then((res) => {
                corpus.sentences.changeId(sentence.id, res.data.id)
            })
    }

    if (element) {
        render((
            <TabSet corpus={ corpus } />
            ),
            element
        );
    }
})
