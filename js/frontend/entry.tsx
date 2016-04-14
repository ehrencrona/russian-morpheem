/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import Corpus from '../shared/Corpus';
import xr from 'xr';
import TabSet from './TabSet';
import {render} from 'react-dom';
import {createElement} from 'react';

let React = { createElement: createElement }

xr.get('/api/corpus')
.then((xhr) => {
    var element = document.getElementById('react-root');
    let corpus = Corpus.fromJson(xhr.data)

    if (element) {
        render((
            <TabSet corpus={ corpus } />
            ),
            element
        );
    }
})

