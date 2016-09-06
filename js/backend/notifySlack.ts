/// <reference path="../../typings/request.d.ts"/>

import { post } from 'request';
import Sentence from '../shared/Sentence'
import Corpus from '../shared/Corpus'
import { getSlackOfAuthor } from './getAuthor'

export enum Channel {
    COMMENTS, SENTENCES
}

const CHANNEL_URL = {
    SENTENCES: 'https://hooks.slack.com/services/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',
    COMMENTS: 'https://hooks.slack.com/services/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'
}


export function notify(message: string, author: string, channel: Channel) {
    post(CHANNEL_URL[channel], {
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
    notify(sentence.toString() + getOpenLink(sentence), sentence.author, Channel.SENTENCES)
}

export function notifyComment(comment: string, sentence : Sentence, author: string, corpus: Corpus) {
    let shoutOuts: { [name: string] : string } = {}

    corpus.sentenceHistory.getEventsForSentence(sentence.id).then((events) => {
        events.forEach((event) => {
            if (event.author != author) {
                let slack = getSlackOfAuthor(event.author)

                if (slack) {
                    shoutOuts[slack.name] = slack.id
                }
            }
        })
    })
    .catch((e) => console.error(e.stack))
    .then(() => {
        notify('> ' + sentence.toUnambiguousString(corpus.words) + getOpenLink(sentence) + '\n' +
            comment + Object.keys(shoutOuts).map((slackName) => 
                ` <@${shoutOuts[slackName]}|${slackName}>`), author, Channel.COMMENTS)
    })
}
