/// <reference path="./xr.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />

import LoginContainer from './LoginContainer'

import 'drag-drop-webkit-mobile';
import xr from 'xr';

import {render} from 'react-dom';
import {createElement} from 'react';

let React = { createElement: createElement }

var element = document.getElementById('react-root');

if (element) {
    render((
        <LoginContainer/>
        ),
        element
    );
}
