/// <reference path="../../typings/request.d.ts"/>

import { post } from 'request';
import Sentence from '../shared/Sentence'

export default function notifySlack(sentence : Sentence) {
    post('https://hooks.slack.com/services/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', {
        body: JSON.stringify(
            { 
                text: sentence.toString() + ' <http://grammar.ru.morpheem.com#' + sentence.id + '|Open>',
                username: sentence.author || 'Unknown'
            })
    }, (error, response, body) => {
        if (error) {
            console.error('While notifying slack: ' + error, body)
        }
    })

}
