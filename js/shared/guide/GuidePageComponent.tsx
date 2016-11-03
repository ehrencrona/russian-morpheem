
import { Component, createElement } from 'react'

import { CASES, POSES } from '../inflection/InflectionForms'
import Corpus from '../Corpus'
import Fact from '../fact/Fact'
import Phrase from '../phrase/Phrase'
import AbstractAnyWord from '../AbstractAnyWord'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus
    fact: Fact
    children?: Element
}

export default function guidePageComponent(props: Props) {
    let description =  ''
    let title = ''

    let factoid = props.corpus.factoids.getFactoid(props.fact)

    if (factoid.name) {
        title = factoid.name
    }

    if (factoid.explanation) {
        description = factoid.explanation.substr(0, 250)
    }

    let fact = props.fact

    if (fact instanceof Phrase) {
        let phrase = fact

        if (!title) {
            title = phrase.getWords().map(w => w.toText()).join(' and ') 
                + ' with the '
                + phrase.getCases().map(c => CASES[c]).join(' ')
                + ' e.g. '
                + phrase.description
                + ' ("' 
                + phrase.en 
                + '")'
        }

        if (!description) {
            description = ' Usage: '
//                + matches[0].sentence.toString() + ' - ' + matches[0].sentence.en()    
        }
    }
    else if (fact instanceof AbstractAnyWord) {
        if (!title) {
            let translations = []

            let translationIndex = 0
            let translation
            
            while (translation = fact.getEnglish('', translationIndex)) {
                translations.push(translation)
                translationIndex++
            }

            title =
                fact.toText() 
                + ' – Russian ' 
                + POSES[fact.pos] 
                + ' meaning '
                + translations.map(t => `"${t}"`).join(', ') 
        }
    }

    if (!title) {
        title = props.fact.getId()
    }

    return <html>

        <head>
            <link rel="stylesheet" type="text/css" href="/stylesheets/study.css"/>

            <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css?family=Rubik:700,900" rel="stylesheet"/>

            <title>{ title }</title>
            <meta name="description" content={ description }/>
        </head>

        <body>
            { props.children }
        </body>

    </html>;
}