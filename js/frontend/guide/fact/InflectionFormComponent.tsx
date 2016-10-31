

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'

import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import { Factoid } from '../../../shared/metadata/Factoids'
import { FORMS, CASES, InflectionForm, INFLECTION_FORMS, POSES } from '../../../shared/inflection/InflectionForms'
import { getFormName } from '../../../shared/inflection/InflectionForms' 
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'

import WordInFormMatch from '../../../shared/phrase/WordInFormMatch'
import PhraseMatch from '../../../shared/phrase/PhraseMatch'
import Phrase from '../../../shared/phrase/Phrase'

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import renderRelatedFact from './renderRelatedFact'
import capitalize from './capitalize'

import StudyFact from '../../study/StudyFact'
import getExamplesUsingInflection from './getExamplesUsingInflection'
import { renderStemToInflected } from './InflectionFactComponent'

import marked = require('marked')

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    form: InflectionForm,
    knowledge: NaiveKnowledge,
    onSelectFact: (fact: Fact, context?: InflectedWord) => any
}

interface State {
    factoid?: Factoid
    allFormations?: boolean,
    allPhrases?: boolean
}

/** Gives general information about a form that matches several forms, typically a case */
export default class InflectionFormComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    factChanged(phrase: InflectionForm) {
        let corpus = this.props.corpus

        corpus.factoids.getFactoid(phrase)
            .then(factoid => this.setState({ factoid: factoid } ))
    }

    componentWillReceiveProps(props: Props) {
        if (props.form.getId() != this.props.form.getId()) {
            this.factChanged(props.form)
        }
    }

    componentWillMount() {
        this.factChanged(this.props.form)
    } 

    findPhrasesWithForm() {
        let corpus = this.props.corpus
        let form = this.props.form

        let allPhrases = corpus.phrases.all().filter((phrase) => 
            phrase.patterns.every((pattern) => 
                !!pattern.wordMatches.find((wordMatch) => {
                    let phraseForm = wordMatch.getForm()

                    return phraseForm && form.matches(phraseForm)
                })
            ))

        let sentencesByFact = this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let getCount = (phrase: Phrase) => {
            let sbf = sentencesByFact[phrase.getId()]

            return (sbf ? sbf.count : 0)
        }

        allPhrases.sort((p1, p2) => getCount(p2) - getCount(p1))

        return allPhrases
    }

    mostCommonInflections(formArray: string[], pos: string) {
        let wordsByInflection = {}
        let corpus = this.props.corpus

        corpus.facts.facts.forEach(fact => {
            if (fact instanceof InflectableWord && fact.pos == pos && fact.inflection.pos == pos) {
                wordsByInflection[fact.inflection.id] = (wordsByInflection[fact.inflection.id] || 0) + 1
            }
        })

        let wordsByInflectionByForm = {}

        for (let form of formArray) {
            wordsByInflectionByForm[form] = {}
        }

        for (let inflectionId in wordsByInflection) {
            let inflection = corpus.inflections.get(inflectionId) 

            for (let form of formArray) {
                let formInflection = inflection.getInflectionId(form)

                if (formInflection) {
                    wordsByInflectionByForm[form][formInflection] = (wordsByInflectionByForm[form][formInflection] || 0) + 
                        wordsByInflection[inflectionId]
                }
            }
        }

        return formArray.map(form => {
            let wordsByInflection = wordsByInflectionByForm[form]

            let inflectionIds = Object.keys(wordsByInflection).sort((form1, form2) => wordsByInflection[form2] - wordsByInflection[form1])

            inflectionIds = inflectionIds.slice(0, (this.state.allFormations ? 99 : (pos == 'pron' ? 5 : 3)))

            return {
                form: form,
                inflectionFacts: inflectionIds.map(inflectionId => 
                    corpus.inflections.getInflection(inflectionId).getFact(form)
                ).filter(f => !!f)
            }
        })
    }

    renderFormation(pos: string, forms: string[]) {
        let form = this.props.form

        return <div key={ pos }>
            <div className='posName'>{ capitalize(POSES[pos]) }s</div>
            <div className='pos'>
                {
                    this.mostCommonInflections(forms, pos).map(i => {

                        return <div key={ i.form } className='form'>
                            <div className='name' >{
                                capitalize(FORMS[i.form].name.replace(form.name, '').trim() || 'singular')
                            }</div>
                            <ul className='formation'>
                            {
                                i.inflectionFacts.map(f => {

                                    return <div key={ f.getId() }>{
                                        getExamplesUsingInflection(i.form, f.inflection, this.props.corpus, this.props.knowledge, null, 1)
                                            .map(w => {
                                                let ending = f.inflection.getEnding(i.form)

                                                return <div key={ i.form }>
                                                    {
                                                        renderStemToInflected(w, i.form, this.props.onSelectFact)
                                                    }
                                                    {
                                                        ending.relativeTo ?
                                                        <div className='relativeTo'>
                                                            ({ 
                                                                !ending.subtractFromStem && !ending.suffix ? 'identical to' : 'formed from' 
                                                            } the { 
                                                                FORMS[f.inflection.getEnding(i.form).relativeTo].name
                                                            })
                                                        </div>
                                                        : 
                                                        null
                                                    }
                                                </div>
                                        })
                                    }</div>

                                })
                            }
                            </ul>
                        </div>
                    })
                }
            </div>
        </div>
    }

    render() {
        let phrases = this.findPhrasesWithForm()
        let corpus = this.props.corpus
        let form = this.props.form

        let forms: InflectionForm[] = []

        const POS = [ 'n', 'adj', 'v', 'pron' ]

        return <div className='inflectionForm'>
            <h1>The { this.props.form.name }</h1>
            <div className='columns'>
                <div className='main'>
                    {
                        this.state.factoid ? 
                            <div className='factoid' 
                                dangerouslySetInnerHTML={ { __html: marked(this.state.factoid.explanation) } }/>
                        :
                            null 
                    }

                    <h3>Formation</h3>

                    { !this.state.allFormations ?
                        <div>
                            These are the most important ways of forming the { form.name }.
                            
                            <div className='seeAll' onClick={ () => this.setState({ allFormations : true })}>See all</div>
                        </div>
                        :                        
                        <div>
                            These are all ways of forming the { form.name }.
                            
                            <div className='seeAll' onClick={ () => this.setState({ allFormations : false })}>See less</div>
                        </div>
                    }
                    {
                        POS.map(pos => {
                            let forms = INFLECTION_FORMS['ru'][pos].allForms
                                .filter(oneForm => 
                                    form.matches(FORMS[oneForm]) && oneForm.indexOf('alt') < 0)

                            if (forms.length) {
                                return this.renderFormation(pos, forms)
                            }
                            else {
                                return null
                            }
                        })            
                    }
                    <div>
                        <h3>Expressions</h3>
                        { !this.state.allPhrases ?
                            <div>
                                These are the most important expressions using the { this.props.form.name }:
                                
                                <div className='seeAll' onClick={ () => this.setState({ allPhrases : true })}>See all</div>
                            </div>
                            :                        
                            <div>
                                These are all expressions using the { this.props.form.name } (in order of commonness):
                                
                                <div className='seeAll' onClick={ () => this.setState({ allPhrases : false })}>See less</div>
                            </div>
                        }

                        <ul className='phrases'>
                        {
                            (this.state.allPhrases ? phrases : phrases.slice(0, 10))
                                .map(phrase => 
                                    renderRelatedFact(phrase, corpus, this.props.onSelectFact) 
                                )
                        }
                        </ul>
                    </div>
                </div>
                <div className='sidebar'>
                    <div>
                        <h3>See also</h3>

                        <ul>
                        {
                            (this.state.factoid ? 
                                this.state.factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) : [])
                                .map(fact =>     
                                    renderRelatedFact(fact, corpus, this.props.onSelectFact) 
                            ) 
                        }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    }
}
