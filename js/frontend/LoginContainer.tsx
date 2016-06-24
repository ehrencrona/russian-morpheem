/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="./auth0.d.ts" />

import TabSetComponent from './TabSetComponent'
import { Component, createElement } from 'react'

import Corpus from '../shared/Corpus'
import Word from '../shared/Word'

import getLanguage from './getLanguage'
import listenForChanges from './listenForChanges'
import generateInflectionForWord from './generateInflectionForWord'

import FrontendSentenceHistory from './metadata/FrontendSentenceHistory'
import FrontendExternalCorpus from './external/FrontendExternalCorpus'

import xr from './xr';

const lang = getLanguage()

interface Props {
}

interface State {
    idToken?: string,
    corpus?: Corpus,
    bypass?: boolean
}

let React = { createElement: createElement }

const TOKEN_ITEM = 'userToken'

export default class LoginContainer extends Component<Props, State> {
    lock: Auth0Lock
        
    constructor(props) {
        super(props)

        this.state = {
            bypass: document.location.hostname == 'localhostt'
        }
    }

    componentWillMount() {
        if (!this.state.bypass) {
            this.lock = new Auth0Lock('BcdEIFVbZCfkNbO1GlL7dqS2ghOIfHBk', 'morpheem.eu.auth0.com');
    
            let idToken = this.getIdToken()

            this.setState({ idToken: idToken })
            
            if (idToken) {
                let xrArgs = { 
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem(TOKEN_ITEM)
                    }
                }

                this.loadCorpus(xrArgs)
            }
            else {
                this.lock.show()
            }
        }
        else {
            this.loadCorpus({})
        }
    }

    loadCorpus(xrArgs) {
        xr.get(`/api/${lang}/corpus`, {}, xrArgs)
        .then((xhr) => {
            let corpus = Corpus.fromJson(xhr.data)

            listenForChanges(corpus, xrArgs, () => {
                localStorage.removeItem(TOKEN_ITEM)
                this.setState({ corpus: null })
            })

            corpus.inflections.generateInflectionForWord = 
                (word: string) => generateInflectionForWord(word, corpus, xrArgs)

            corpus.sentenceHistory = new FrontendSentenceHistory(xrArgs, corpus.lang)
            corpus.externalCorpus = new FrontendExternalCorpus(xrArgs, corpus)

            this.setState({ corpus: corpus })
        })
        .catch((e) => {
            console.log(e.stack)
            if (e.status == 401) {
                localStorage.removeItem(TOKEN_ITEM)
            }
        })
    }

    getIdToken() {
        var idToken = localStorage.getItem(TOKEN_ITEM)
        
        if (!idToken) {
            var authHash = this.lock.parseHash(window.location.hash)
            
            if (authHash && authHash.id_token) {
                idToken = authHash.id_token
                localStorage.setItem(TOKEN_ITEM, authHash.id_token)
            }

            if (authHash && authHash.error) {
                console.log("Error signing in", authHash)
            }
        }

        return idToken
    }

    render() {
        if ((this.state.bypass || this.state.idToken) && this.state.corpus) {
            return <TabSetComponent corpus={ this.state.corpus } />
        }
        else {
            return <div/>
        }   
    }
}