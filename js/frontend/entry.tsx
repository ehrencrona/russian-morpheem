/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/index.d.ts" />

import LoginContainer from './LoginContainer'
import StudyContainerComponent from './study/StudyContainerComponent'
import TabSetComponent from './TabSetComponent'

import HomeSearchComponent from '../shared/guide/search/HomeSearchComponent'
import ExplainSentenceComponent from '../shared/guide/ExplainSentenceComponent'
import GuideSearchComponent from '../shared/guide/GuideSearchComponent'

import xr from 'xr'

import { render } from 'react-dom'
import { createElement, createFactory } from 'react'

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

if (document.getElementById('react-admin-root')) {
    require('drag-drop-webkit-mobile')
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
    <LoginContainer bypass={ true } noSpinner={ true } factory={ createFactory(GuideSearchComponent) }/>,
    'react-guide-search'
)

renderIntoId(
    <LoginContainer bypass={ true } factory={ createFactory(HomeSearchComponent) }/>,
    'react-home-search'
)
