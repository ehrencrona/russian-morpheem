
import {
    EXPECTED_REPETITIONS_IN_SESSION,
    FixedIntervalFactSelector
} from '../../shared/study/FixedIntervalFactSelector';
import Fact from '../../shared/fact/Fact'
import { Component, createElement } from 'react'

let React = { createElement: createElement }

export default function factProgressComponent(props: { factSelector: FixedIntervalFactSelector, fact: Fact }) {

    let percentage = 100 * Math.max(1 - 
        props.factSelector.getExpectedRepetitions(props.fact, false) / 
        EXPECTED_REPETITIONS_IN_SESSION, 0)

    return <div className='progress'>
        <div className='barContainer'>
            <div className={ 'start' + (percentage == 0 ? ' empty' : '')}>&nbsp;</div>

            <div className='bar'>
                <div className='full' style={ { width: percentage + '%' }}>&nbsp;</div>
            </div>

            <div className={ 'end'  + (percentage == 100 ? ' full' : '') }>&nbsp;</div>
        </div>
    </div>
}
