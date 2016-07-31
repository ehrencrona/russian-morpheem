/// <reference path="../../../typings/request.d.ts"/>
/// <reference path="../../../typings/globals/html-entities/index.d.ts"/>

import { get } from 'request';

var apiKey = 'AIzaSyDSw1HZQxVaucBB2R53mQQ1x4mx9vvxmsU'

import * as express from 'express'

import { SentenceStatusResponse } from '../../shared/metadata/SentenceHistory'
import { SentenceStatus } from '../../shared/metadata/SentenceStatus'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'
import { Html4Entities } from 'html-entities'

let entities = new Html4Entities()

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let text = req.query.text

        var query = '&q=' + encodeURIComponent(text)

        let toLanguage = 'en'
        let fromLanguage = corpus.lang

        get("https://www.googleapis.com/language/translate/v2" +
            "?key=" + apiKey +
            "&source=" +
            fromLanguage +
            "&target=" + toLanguage + query, {},
            (error, response, body) => {
                if (error) {
                    res.status(500).send({error: 
                        'Google translate of "' + text +
                        '" from ' + fromLanguage +
                        ' to ' + toLanguage + ' failed: ' + error
                    })
                }
                else {
                    body = JSON.parse(body)

                    if (body && body.data && body.data.translations.length) {
                        res.status(200).send({ translation: entities.decode(body.data.translations[0].translatedText) })
                    }
                    else {
                        res.status(500).send({error: 
                            'Google translate of "' + text +
                            '" from ' + fromLanguage +
                            ' to ' + toLanguage + ' returned no translations: ' + JSON.stringify(body)})
                    }
                }
            })
    }    
}
