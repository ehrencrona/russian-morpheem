'use strict';

import { expect } from 'chai';
import parseInflectionsFile from '../shared/inflection/InflectionsFileParser'
import inflectionsToString from '../shared/inflection/InflectionsFileGenerator'
import Transforms from '../shared/Transforms'

describe('InflectionsFileGenerator', function() {
    it('generates same string as the read one', function () {
        
        let file = 'verbs[v]: inf ш, pastm л, pastf pastm-<ла\n' +
            'specials[v]: inf <у, inherit verbs'

        expect(inflectionsToString(parseInflectionsFile(file, 'ru'), 'ru')).to.equal(file)              
    })

    it('handles transofrms', function () {
        
        let file = 'verbs[adj]: m ый, transform yToI'

        expect(inflectionsToString(parseInflectionsFile(file, 'ru'), 'ru')).to.equal(file)              
    })
})
