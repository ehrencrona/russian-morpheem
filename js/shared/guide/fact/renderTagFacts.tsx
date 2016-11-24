import { NamedWordForm } from '../../inflection/WordForm';
import { Factoid, Factoids } from '../../metadata/Factoids';
import Corpus from '../../Corpus';
import Fact from '../../../shared/fact/Fact';
import InflectableWord from '../../../shared/InflectableWord';
import InflectionForm from '../../../shared/inflection/InflectionForm';
import Phrase from '../../../shared/phrase/Phrase';
import TagFact from '../../../shared/TagFact';
import Word from '../../../shared/Word';
import FactLinkComponent from './FactLinkComponent';
import { createElement } from 'react';


let React = { createElement: createElement }


export default function renderTagFacts(fact: Fact, corpus: Corpus, factLinkComponent: FactLinkComponent, addFacts?: Fact[] ) {
    return <ul className='renderTagFacts'>{
        addFacts.concat(
            corpus.facts.getTagsOfFact(fact)
                .map(tag => { 
                    let tagFact = new TagFact(tag)

                    return corpus.factoids.getFactoid(tagFact).name && tagFact
                })
                .filter(f => !!f))
            .map(f => {
                let name

                if (f instanceof NamedWordForm) {
                    name = f.name
                }

                if (!name) {
                    name = corpus.factoids.getFactoid(f).name
                }

                return <li key={ f.getId() }>{
                    React.createElement(factLinkComponent, { fact: f }, name)
                }</li>
            })
    }</ul>
}
