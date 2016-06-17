class Forms {
    allForms: string[] = []
    
    constructor(public cols: string[], public rows: string[], public forms: any[][]) {
        this.cols = cols
        this.rows = rows
        this.forms = forms

        forms.forEach((line) =>
            line.forEach((form) => {
                if (typeof form == 'object') {
                    this.allForms = this.allForms.concat(form)
                }
                else {
                    this.allForms.push(form)
                }
            }))
    }
    
    formExists(form: string) {
        return this.allForms.indexOf(form) >= 0
    }
}
    
const INFLECTION_FORMS : { [s: string]: { [s: string]: Forms } } = {
    lat: {
        verb: new Forms(
            [ 'singular', 'plural', 'passive sg', 'passive pl' ],
            [ 'infinitive', '1st person', '2nd person', '3rd person' ],
            [ 
                ['inf'], ['1', '1pl', 'pass1', 'pass1pl'], 
                ['2', '2pl', 'pass2', 'pass2pl'], ['3', '3pl', 'pass3', 'pass3pl'] 
            ]),

        adj: new Forms(
            [ 'masc sg', 'masc pl', 'fem sg', 'fem pl', 'n sg', 'n pl' ], 
            [ 'nom', 'gen', 'dat', 'acc', 'abl', 'voc' ],
            [                
                [ 'nomm', 'nommpl', 'nomf', 'nomfpl', 'nomn', 'nomnpl' ],
                [ 'genm', 'genmpl', 'genf', 'genfpl', 'genn', 'gennpl' ],
                [ 'datm', 'datmpl', 'datf', 'datfpl', 'datn', 'datnpl' ],
                [ 'accm', 'accmpl', 'accf', 'accfpl', 'accn', 'accnpl' ],
                [ 'ablm', 'ablmpl', 'ablf', 'ablfpl', 'abln', 'ablnpl' ],
                [ 'vocm', 'vocmpl', 'vocf', 'vocfpl', 'vocn', 'vocnpl' ]
            ]),

        n: new Forms(
            [ 'singular', 'plural' ], 
            [ 'nom', 'gen', 'dat', 'acc', 'abl', 'voc' ],
            [        
                ['nom','pl'],
                ['gen','genpl'],
                ['dat','datpl'],
                ['acc','accpl'],
                ['abl','ablpl'],
                ['voc','vocpl']
            ])
    },
    ru: {
        v: new Forms(
            [ 'singular', 'plural' ],
            [ 'infinitive', '1st person', '2nd person', '3rd person', 'past', 'imperative'],
            [ ['inf'], ['1', '1pl'], ['2', '2pl'], ['3', '3pl'], 
              [ ['pastm', 'pastn', 'pastf'], 'pastpl' ], [ 'impr', 'imprpl' ] ]
        ),
        adj: new Forms(
            [ 'm sg', 'n sg', 'f sg', 'plural' ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep', 'short', 'adv', 'comp' ],
            [
                ['m','n','f','pl'],
                ['genm','genn','genf','genpl'],
                ['datm','datn','datf','datpl'],
                [ [ 'accinanm', 'accanm' ],'accn','accf', [ 'accinanpl', 'accanpl' ]],
                ['instrm','instrn','instrf','instrpl'],
                ['prepm','prepn','prepf','preppl'],
                ['shortm', 'shortn', 'shortf', 'shortpl'],
                ['adv'],
                ['comp']
            ]),
        n: new Forms(
            [ 'singular', 'plural' ], 
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [        
                ['nom','pl'],
                ['gen','genpl'],
                ['dat','datpl'],
                ['acc','accpl'],
                ['instr','instrpl'],
                ['prep','preppl']
            ]),
        num: new Forms(
            [ 'm sg', 'n sg', 'f sg', 'plural' ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [
                ['m','n','f','pl'],
                ['genm','genn','genf','genpl'],
                ['datm','datn','datf','datpl'],
                [ [ 'accinanm', 'accanm' ],'accn','accf', [ 'accinanpl', 'accanpl' ]],
                ['instrm','instrn','instrf','instrpl'],
                ['prepm','prepn','prepf','preppl'],
            ]),
        prep: new Forms(
            [ 'normal', 'alternative' ], 
            [ ],
            [ [ 'std', 'alt', 'alt2' ] ]
        ),
        pron: new Forms(
            [ ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [ ['nom'], ['gen'], ['dat'], ['acc'], ['instr'], ['prep'] ]
        )
    }
}

export function formExists(lang, pos, form) {
    let forms = INFLECTION_FORMS[lang] && INFLECTION_FORMS[lang][pos]
    
    if (forms) {
        return forms.formExists(form)
    }
    else {
        return false
    }
}

export default INFLECTION_FORMS