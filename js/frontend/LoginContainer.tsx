
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
import loadFactoids from './metadata/FrontendFactoids'
import FrontendTopics from './metadata/FrontendTopics'

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
    bypass?: boolean
    noSpinner?: boolean
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
            bypass: document.location.hostname == 'localhost' || props.bypass,
            loading: true
        }

        setOnException((message, e) => {
            this.setState({ error: message.toString() })

            if (e.status == 401) {
                localStorage.removeItem(TOKEN_ITEM)
                this.lock.show()
            }
        })
    }

    componentWillMount() {
        if (!this.state.bypass) {
            this.lock = new Auth0Lock('dQgtYQ55BKV0dlVOQqJ5BlSUE27v1I8s', 'morpheemru.eu.auth0.com');
    
            this.lock.on("authenticated", (authResult) => {
                // Use the token in authResult to getUserInfo() and save it to localStorage
                this.lock.getUserInfo(authResult.accessToken, function(error, profile) {
                  if (error) {
                    console.error(error);

                    return;
                  }
              
                  localStorage.setItem(TOKEN_ITEM, authResult.accessToken);
                });
              });

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

                if (ga) {
                    ga('send', 'event', 'login', 'login')
                }
            }
        }
        else {
            this.loadCorpus({})
        }
    }

    loadCorpus(xrArgs) {
        this.xrArgs = xrArgs

        Promise.all([
            xr.get(`/public-api/${lang}/corpus`, {}, xrArgs),
            loadFactoids(xrArgs, lang)
        ])
        .then(([ xhr, factoids ]) => {
            let corpus = FrontendCorpus.fromJson(xhr.data)

            corpus.setXrArgs(xrArgs)

            listenForChanges(corpus, xrArgs, () => {
                localStorage.removeItem(TOKEN_ITEM)
                this.setState({ corpus: null })
            })

            corpus.sentenceHistory = new FrontendSentenceHistory(xrArgs, corpus.lang)
            corpus.phraseHistory = new FrontendPhraseHistory(xrArgs, corpus.lang)
            corpus.externalCorpus = new FrontendExternalCorpus(xrArgs, corpus)
            corpus.factoids = factoids
            corpus.topics = new FrontendTopics(xrArgs, corpus.lang, corpus.facts)

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
        
        return idToken
    }

    render() {
        if ((this.state.bypass || this.state.idToken)) {
            let main = (this.state.corpus ?
                this.props.factory({ corpus: this.state.corpus, xrArgs: this.xrArgs })
                :
                <div/>)

            if (this.state.loading) {
                if (this.props.noSpinner) {
                    return <div/>
                }
                else {
                    return <img className='spinner' src='/img/spinner.gif'/>
                }
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