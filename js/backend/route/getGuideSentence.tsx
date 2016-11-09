import * as express from 'express'

import ExplainSentenceComponent from '../../shared/guide/ExplainSentenceComponent'
import GuidePageComponent from '../../shared/guide/GuidePageComponent'

import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Fact from '../../shared/fact/Fact'

import getGuideUrl from '../../shared/guide/getGuideUrl'

import { Component, createElement } from 'react'

import DOMServer = require('react-dom/server')

let React = { createElement: createElement }

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        if (req.hostname == 'russian.morpheem.com') {
            res.header({ 'Cache-Control': 'public, max-age=300000' });
        }

        let sentenceId = parseInt(req.params.sentence)

        let sentence = corpus.sentences.get(sentenceId)

        if (!sentence) {
            return res.send(`Unknown sentence ${ sentenceId }.`).status(404)
        }

        let html = DOMServer.renderToString(
            <GuidePageComponent
                corpus={ corpus }
                fact={ null }
                bodyClass='sentence'>
                <ExplainSentenceComponent
                    corpus={ corpus }
                    sentence={ sentence }
                    factLinkComponent={ (props) => 
                        <a rel={ props.fact instanceof Sentence ? 'nofollow' : '' } 
                            href={ getGuideUrl(props.fact as Fact, props.context) }>{ props.children }</a> 
                    } 
                />
            </GuidePageComponent>)

        res.send(html).status(200);

    }
}