/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import LoginContainer from './LoginContainer'
import StudyComponent from './study/StudyComponent'
import TabSetComponent from './TabSetComponent'

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
    'react-root'
)

renderIntoId(
    <LoginContainer factory={ createFactory(StudyComponent) }/>,
    'react-study-root'
)
