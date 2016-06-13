/// <reference path="../../typings/request.d.ts"/>

import { post } from 'request';
import Sentence from '../shared/Sentence'

export function notify(message: string, author: string) {
    post('https://hooks.slack.com/services/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', {
        body: JSON.stringify(
            { 
                text: message,
                username: author || 'Unknown'
            })
    }, (error, response, body) => {
        if (error) {
            console.error('While notifying slack: ' + error, body)
        }
    })
}

export function notifyAdd(sentence : Sentence) {
    notify(sentence.toString() + ' <http://grammar.ru.morpheem.com#' + sentence.id + '|Open>',
            sentence.author)
}

export function notifyComment(sentence : Sentence, comment: string, author: string) {
    notify('> ' + sentence.toString() + ' <http://grammar.ru.morpheem.com#' + sentence.id + '|Open>\n' +
        comment, author)
}
