/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import Corpus from '../shared/Corpus';
import xr from 'xr';
import TestComponent from './TestComponent';
import {render} from 'react-dom';
import {createElement} from 'react';

let React = { createElement: createElement }

xr.get('/api/corpus')
.then((corpusJson) => {
    var element = document.getElementById('react-root');

    let corpus = Corpus.fromJson(corpusJson)

    if (element) {
        render((
            <TestComponent corpus={ corpus }>
            </TestComponent>
            ),
            element
        );
    }
})

