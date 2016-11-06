
import Fact from '../../fact/Fact'
import Sentence from '../../Sentence'
import InflectedWord from '../../InflectedWord'

import { Component, ReactNode, StatelessComponent, createElement } from 'react'

interface EmptyProps {
}

interface Props {
    fact: Fact|Sentence
    children?: ReactNode, 
    context?: InflectedWord
}

type FactLink = StatelessComponent<Props>

export default FactLink
