/// <reference path="../../typings/request.d.ts"/>

import { post } from 'request';
import Sentence from '../shared/Sentence'

export default function notifySlack(sentence : Sentence) {
console.log('notify')
    post('https://hooks.slack.com/services/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', {
        body: JSON.stringify(
            { 
                text: sentence.toString(),
                username: sentence.author || 'Unknown'
            })
    }, (error, response, body) => {
        if (error) {
            console.error('While notifying slack: ' + error, body)
        }
    })

}
