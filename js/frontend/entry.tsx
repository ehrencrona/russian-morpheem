/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/index.d.ts" />

import LoginContainer from './LoginContainer'
import StudyContainerComponent from './study/StudyContainerComponent'
import TabSetComponent from './TabSetComponent'

import ExplainSentenceComponent from '../shared/guide/ExplainSentenceComponent'
import GuideSearchComponent from '../shared/guide/GuideSearchComponent'

import 'drag-drop-webkit-mobile';
import xr from 'xr';

import {render} from 'react-dom';
import {createElement, createFactory} from 'react';

let React = { createElement: createElement }

function renderIntoId(component, elementId) {
    var element = document.getElementById(elementId);

    if (element) {
        render((
            component
            ),
            element
        );
    }
}

renderIntoId(
    <LoginContainer factory={ createFactory(TabSetComponent) }/>,
    'react-admin-root'
)

renderIntoId(
    <LoginContainer factory={ createFactory(StudyContainerComponent) }/>,
    'react-study-root'
)

renderIntoId(
    <LoginContainer bypass={ true } factory={ createFactory(GuideSearchComponent) }/>,
    'react-guide-search'
)
