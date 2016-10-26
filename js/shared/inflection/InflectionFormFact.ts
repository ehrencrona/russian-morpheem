'use strict'

import Grammar from '../Grammar'
import Inflection from './Inflection'
import { InflectionForm } from './InflectionForms'

export default class InflectionFormFact extends Grammar {
    constructor(id, public inflectionForm: InflectionForm) {
        super(id, '');

        this.inflectionForm = inflectionForm
    }
}