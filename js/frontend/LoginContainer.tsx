
/// <reference path="./auth0.d.ts" />


import { Component, createElement, Factory } from 'react'

import FrontendCorpus from './corpus/FrontendCorpus'
import Corpus from '../shared/Corpus'
import Word from '../shared/Word'

import getLanguage from './getLanguage'
import listenForChanges from './listenForChanges'

import FrontendSentenceHistory from './metadata/FrontendSentenceHistory'
import FrontendPhraseHistory from './metadata/FrontendPhraseHistory'
import FrontendExternalCorpus from './external/FrontendExternalCorpus'
import FrontendFactoids from './metadata/FrontendFactoids'

import { setXrArgs } from './sentence/googleTranslate' 
import { setXrArgs as setRecorderXrArgs } from './Recorder' 

import xr from './xr';
import { setOnException } from './xr';

const lang = getLanguage()

interface BuiltProps {
    corpus: Corpus
    xrArgs: { [arg: string] : string }
}

interface Props {
    factory: Factory<BuiltProps>
}

interface State {
    idToken?: string,
    corpus?: Corpus,
    bypass?: boolean,
    loading?: boolean,
    error?: string
}

let React = { createElement: createElement }

const TOKEN_ITEM = 'userToken'

export default class LoginContainer extends Component<Props, State> {
    lock: Auth0Lock
    xrArgs: { [arg: string] : string }
        
    constructor(props) {
        super(props)

        this.state = {
            bypass: document.location.hostname == 'localhost',
            loading: true
        }

        setOnException((message) => {
            this.setState({ error: message.toString() })
        })
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
        this.xrArgs = xrArgs

        xr.get(`/api/${lang}/corpus`, {}, xrArgs)
        .then((xhr) => {
            let corpus = FrontendCorpus.fromJson(xhr.data)

            corpus.setXrArgs(xrArgs)

            listenForChanges(corpus, xrArgs, () => {
                localStorage.removeItem(TOKEN_ITEM)
                this.setState({ corpus: null })
            })

            corpus.sentenceHistory = new FrontendSentenceHistory(xrArgs, corpus.lang)
            corpus.phraseHistory = new FrontendPhraseHistory(xrArgs, corpus.lang)
            corpus.externalCorpus = new FrontendExternalCorpus(xrArgs, corpus)
            corpus.factoids = new FrontendFactoids(xrArgs, corpus.lang)

            setXrArgs(xrArgs)
            setRecorderXrArgs(xrArgs)

            this.setState({ corpus: corpus, error: null, loading: false })
        })
        .catch((e) => {
            console.log('While loading corpus: ', e.stack || e)

            let message = e.response || e.stack || e;

            message = message.toString().substr(0, 100)

            this.setState({ error: 'Error while loading corpus: ' + message, loading: false })

            if (e.status == 401) {
                localStorage.removeItem(TOKEN_ITEM)
                this.lock.show()
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
        if ((this.state.bypass || this.state.idToken)) {
            let main = (this.state.corpus ?
                this.props.factory({ corpus: this.state.corpus, xrArgs: this.xrArgs })
                :
                <div/>)

            if (this.state.loading) {
                return <img className='spinner' src='/img/spinner.gif'/>
            }
            else if (this.state.error) {
                return <div>
                    <div className='globalError' onClick={ () => this.setState( { error: null }) } >{ this.state.error }</div>
                    { main }
                </div>
            }
            else {
                return main
            }
        }
        else {
            return <div/>
        }   
    }
}