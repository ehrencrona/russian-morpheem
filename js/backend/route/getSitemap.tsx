import * as express from 'express'

import FactComponent from '../../shared/guide/fact/FactComponent'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import { InflectionForm, FORMS } from '../../shared/inflection/InflectionForms'
import AbstractAnyWord from '../../shared/AbstractAnyWord'

let sitemap = require('express-sitemap')
import getGuideUrl from './getGuideUrl'

import { Component, createElement } from 'react'

let React = { createElement: createElement }

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let get = ['get']

        let map = []

        corpus.facts.facts.forEach(fact => {
            if (fact instanceof Phrase ||
                fact instanceof AbstractAnyWord ||
                fact instanceof InflectionForm) {

                map[getGuideUrl(fact)] = get 
            }
        })

        for (let formId in FORMS) {
            map[getGuideUrl(FORMS[formId])] = get 
        }

        var host = 'russian.morpheem.com'

        sitemap({map: map, route: {}, url: host}).XMLtoWeb(res)

    }
}