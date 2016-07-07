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

export let FORM_NAMES = {

    1: 'first person (I)',
    2: 'second person (you)',
    3: 'third person (s/he, it)',
    '1pl': 'first person plural (we)',
    '2pl': 'second person plural (you)',
    '3pl': 'third person plural (they)',
    'pastm': 'masculine past',
    'pastn': 'neuter past',
    'pastf': 'feminine past',
    'impr': 'imperative',
    'imprpl': 'imperative plural',

    inf: 'infinitive',
    
    m: 'masculine',
    f: 'feminine',
    n: 'neuter',
    pl: 'plural',

    nom: 'nominative',
    gen: 'genitive', 
    dat: 'dative',
    acc: 'accusative',
    instr: 'instrumental',
    prep: 'prepositional',

    adv: 'adverb',
    comp: 'comparative',

    accanm: 'accusative masculine animate',
    accinanm: 'accusative masculine inanimate',

    accanpl: 'accusative masculine animate plural',
    accinanpl: 'accusative masculine inanimate plural',

    shortf: 'short form feminine',
    shortn: 'short form neuter',
    shortm: 'short form masculine',
    shortpl: 'short form plural',

    alt: 'alternative form',
    'alt2': 'alternative form'
}

const CASES = [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ]

CASES.forEach((form) => {
    FORM_NAMES[form + 'pl'] = FORM_NAMES[form] + ' plural' 
    FORM_NAMES[form + 'm'] = FORM_NAMES[form] + ' masculine' 
    FORM_NAMES[form + 'n'] = FORM_NAMES[form] + ' neuter' 
    FORM_NAMES[form + 'f'] = FORM_NAMES[form] + ' feminine'
    FORM_NAMES[form + 'alt'] = FORM_NAMES[form] + ' alternative form'
})

const INFLECTION_FORMS : { [s: string]: { [s: string]: Forms } } = {
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
            [ ], 
            [ ],
            [ [ 'std', 'alt', 'alt2' ] ]
        ),
        pron: new Forms(
            [ ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [ ['nom', 'nomalt'], ['gen', 'genalt'], ['dat', 'datalt'], ['acc', 'accalt'], ['instr', 'instralt'], ['prep', 'prepalt'] ]
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