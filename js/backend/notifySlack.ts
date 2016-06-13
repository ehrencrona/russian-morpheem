/// <reference path="../../typings/request.d.ts"/>

import { post } from 'request';
import Sentence from '../shared/Sentence'
import { getEvents } from './metadata/Metadata'
import { getSlackOfAuthor } from './getAuthor'

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

function getOpenLink(sentence: Sentence) {
    return ' <http://grammar.ru.morpheem.com#' + sentence.id + '|Open>'
}

export function notifyAdd(sentence : Sentence) {
    notify(sentence.toString() + getOpenLink(sentence), sentence.author)
}

export function notifyComment(comment: string, sentence : Sentence, author: string) {
    let shoutOuts: { [name: string] : boolean } = {}

    getEvents(sentence.id).then((events) => {
        events.forEach((event) => {
            if (event.author != author) {
                let slack = getSlackOfAuthor(event.author)

                if (slack) {
                    shoutOuts[slack] = true
                }
            }
        })
    })
    .catch((e) => console.error(e.stack))
    .then(() => {
        notify('> ' + sentence.toString() + '\n' +
            comment + getOpenLink(sentence) + 
                Object.keys(shoutOuts).map((slack) => ' @' + slack)
                , author)
    })
}
