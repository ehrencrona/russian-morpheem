'use strict'

import Grammar from '../Grammar'
import Inflection from './Inflection'

export default class InflectionFact extends Grammar {
    constructor(public id, public inflection: Inflection, public form: string) {
        super(id, '');
    }
}