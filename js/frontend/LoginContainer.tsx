/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="./auth0.d.ts" />

import TabSetComponent from './TabSetComponent'
import { Component, createElement } from 'react'
import Corpus from '../shared/Corpus'
import xr from 'xr'
import getLanguage from './getLanguage'
import listenForChanges from './listenForChanges'

const lang = getLanguage()

interface Props {
}

interface State {
    idToken?: string,
    corpus?: Corpus,
    bypass?: boolean
}

let React = { createElement: createElement }

export default class LoginContainer extends Component<Props, State> {
    lock: Auth0Lock
    
    constructor(props) {
        super(props)

        this.state = {
            bypass: document.location.hostname == 'localhost'
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
                        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
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
            
            listenForChanges(corpus, xrArgs)
            
            this.setState({ corpus: corpus })
        })
    }

    getIdToken() {
        var idToken = localStorage.getItem('userToken')
        var authHash = this.lock.parseHash(window.location.hash)
        
        if (!idToken && authHash) {
            if (authHash.id_token) {
                idToken = authHash.id_token
                localStorage.setItem('userToken', authHash.id_token)
            }

            if (authHash.error) {
                console.log("Error signing in", authHash)
                return null
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