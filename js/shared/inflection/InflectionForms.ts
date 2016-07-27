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

export enum Gender {
    M, N, F
}

export enum Tense {
    PRESENT, PAST
}

export enum GrammaticalCase {
    NOM, GEN, DAT, ACC, INSTR, PREP, LOC
}

export enum Person {
    FIRST, SECOND, THIRD
}

export enum Animateness {
    INANIMATE, ANIMATE
}

export enum Number {
    SINGULAR, PLURAL
}

export enum Comparison {
    NORMAL, COMPARATIVE
}

export enum AdjectiveForm {
    NORMAL, SHORT
}

export enum PartOfSpeech {
    ADVERB
}

interface FormComponents {
    gender?: Gender, 
    tense?: Tense, 
    grammaticalCase?: GrammaticalCase, 
    animate?: Animateness, 
    number?: Number, 
    person?: Person, 
    comparison?: Comparison,
    adjectiveForm?: AdjectiveForm,
    pos?: PartOfSpeech
}

export class InflectionForm {
    gender: Gender
    tense: Tense
    grammaticalCase: GrammaticalCase 
    animate: Animateness
    number: Number
    person: Person
    comparison: Comparison
    adjectiveForm: AdjectiveForm
    pos: PartOfSpeech

    constructor(public id: string, public name: string, used: FormComponents) {
        this.id = id
        this.name = name
        this.gender = used.gender
        this.tense = used.tense
        this.grammaticalCase = used.grammaticalCase
        this.animate = used.animate
        this.number = used.number
        this.person = used.person
        this.comparison = used.comparison
        this.adjectiveForm = used.adjectiveForm
        this.pos = used.pos
    }

}

export let FORMS: { [id: string]: InflectionForm } = {}

function addForm(id: string, name: string, components: FormComponents) {
    FORMS[id] = new InflectionForm(id, name, components)
}

export let CASES = {}

CASES[GrammaticalCase.NOM] = 'nom'
CASES[GrammaticalCase.GEN] = 'gen'
CASES[GrammaticalCase.DAT] = 'dat'
CASES[GrammaticalCase.ACC] = 'acc'
CASES[GrammaticalCase.INSTR] = 'instr'
CASES[GrammaticalCase.PREP] = 'prep'
CASES[GrammaticalCase.LOC] = 'loc'


addForm('1', 'first person (I)', { person: Person.FIRST, number: Number.SINGULAR, tense: Tense.PRESENT }),
addForm('2', 'second person (you)', { person: Person.SECOND, number: Number.SINGULAR, tense: Tense.PRESENT }),
addForm('3', 'third person (s/he, it)', { person: Person.THIRD, number: Number.SINGULAR, tense: Tense.PRESENT }),
addForm('1pl', 'first person plural (we)', { person: Person.FIRST, number: Number.PLURAL, tense: Tense.PRESENT }),
addForm('2pl', 'second person plural (you)', { person: Person.SECOND, number: Number.PLURAL, tense: Tense.PRESENT }),
addForm('3pl', 'third person plural (they)', { person: Person.THIRD, number: Number.PLURAL, tense: Tense.PRESENT }),
addForm('pastm', 'masculine past', { gender: Gender.M, number: Number.SINGULAR, tense: Tense.PAST })
addForm('pastn', 'neuter past', { gender: Gender.N, number: Number.SINGULAR, tense: Tense.PAST })
addForm('pastf', 'feminine past', { gender: Gender.F, number: Number.SINGULAR, tense: Tense.PAST })
addForm('pastpl', 'past plural', { number: Number.PLURAL, tense: Tense.PAST })
addForm('impr', 'imperative', { number: Number.SINGULAR })
addForm('imprpl', 'imperative plural', { number: Number.PLURAL })
addForm('inf', 'infinitive', {})

addForm('past', 'past', { tense: Tense.PAST })

addForm('m', 'masculine', { gender: Gender.M, number: Number.SINGULAR })
addForm('f', 'feminine', { gender: Gender.F, number: Number.SINGULAR })
addForm('n', 'neuter', { gender: Gender.N, number: Number.SINGULAR })
addForm('pl', 'plural', { number: Number.PLURAL })
addForm('fpl', 'feminine plural', { number: Number.PLURAL, gender: Gender.F })

addForm('nom', 'nominative', { grammaticalCase: GrammaticalCase.NOM, number: Number.SINGULAR })
addForm('gen', 'genitive', { grammaticalCase: GrammaticalCase.GEN, number: Number.SINGULAR })
addForm('dat', 'dative', { grammaticalCase: GrammaticalCase.DAT, number: Number.SINGULAR })
addForm('acc', 'accusative', { grammaticalCase: GrammaticalCase.ACC, number: Number.SINGULAR })
addForm('instr', 'instrumental', { grammaticalCase: GrammaticalCase.INSTR, number: Number.SINGULAR })
addForm('prep', 'prepositional', { grammaticalCase: GrammaticalCase.PREP, number: Number.SINGULAR })
addForm('loc', 'locative', { grammaticalCase: GrammaticalCase.LOC, number: Number.SINGULAR })
addForm('locpl', 'locative plural', { grammaticalCase: GrammaticalCase.LOC, number: Number.PLURAL })

// this is a bit of a hack to make it possible select a case independent of number if phrases.
// "gen" should be renamed into "gensg" and "genitive" to "gen" at some point
addForm('nominative', 'nominative', { grammaticalCase: GrammaticalCase.NOM })
addForm('genitive', 'genitive', { grammaticalCase: GrammaticalCase.GEN })
addForm('dative', 'dative', { grammaticalCase: GrammaticalCase.DAT })
addForm('accusative', 'accusative', { grammaticalCase: GrammaticalCase.ACC })
addForm('instrumental', 'instrumental', { grammaticalCase: GrammaticalCase.INSTR })
addForm('prepositional', 'prepositional', { grammaticalCase: GrammaticalCase.PREP })
addForm('locative', 'locative', { grammaticalCase: GrammaticalCase.LOC })

addForm('genf', 'genitive feminine', { grammaticalCase: GrammaticalCase.GEN, number: Number.SINGULAR, gender: Gender.F })
addForm('datf', 'dative feminine', { grammaticalCase: GrammaticalCase.DAT, number: Number.SINGULAR, gender: Gender.F })
addForm('accf', 'accusative feminine', { grammaticalCase: GrammaticalCase.ACC, number: Number.SINGULAR, gender: Gender.F })
addForm('instrf', 'instrumental feminine', { grammaticalCase: GrammaticalCase.INSTR, number: Number.SINGULAR, gender: Gender.F })
addForm('prepf', 'prepositional feminine', { grammaticalCase: GrammaticalCase.PREP, number: Number.SINGULAR, gender: Gender.F })

addForm('genn', 'genitive neuter', { grammaticalCase: GrammaticalCase.GEN, number: Number.SINGULAR, gender: Gender.N })
addForm('datn', 'dative neuter', { grammaticalCase: GrammaticalCase.DAT, number: Number.SINGULAR, gender: Gender.N })
addForm('accn', 'accusative neuter', { grammaticalCase: GrammaticalCase.ACC, number: Number.SINGULAR, gender: Gender.N })
addForm('instrn', 'instrumental neuter', { grammaticalCase: GrammaticalCase.INSTR, number: Number.SINGULAR, gender: Gender.N })
addForm('prepn', 'prepositional neuter', { grammaticalCase: GrammaticalCase.PREP, number: Number.SINGULAR, gender: Gender.N })

addForm('genm', 'genitive masculine', { grammaticalCase: GrammaticalCase.GEN, number: Number.SINGULAR, gender: Gender.M })
addForm('datm', 'dative masculine', { grammaticalCase: GrammaticalCase.DAT, number: Number.SINGULAR, gender: Gender.M })
addForm('accanm', 'accusative masculine animate', { grammaticalCase: GrammaticalCase.ACC, gender: Gender.M, animate: Animateness.ANIMATE, number: Number.SINGULAR })
addForm('accinanm', 'accusative masculine inanimate', { grammaticalCase: GrammaticalCase.ACC, gender: Gender.M, animate: Animateness.INANIMATE, number: Number.SINGULAR })
addForm('instrm', 'instrumental masculine', { grammaticalCase: GrammaticalCase.INSTR, number: Number.SINGULAR, gender: Gender.M })
addForm('prepm', 'prepositional masculine', { grammaticalCase: GrammaticalCase.PREP, number: Number.SINGULAR, gender: Gender.M })

addForm('pl', 'nominative plural', { grammaticalCase: GrammaticalCase.NOM, number: Number.PLURAL })
addForm('genpl', 'genitive plural', { grammaticalCase: GrammaticalCase.GEN, number: Number.PLURAL })
addForm('datpl', 'dative plural', { grammaticalCase: GrammaticalCase.DAT, number: Number.PLURAL })
addForm('accpl', 'accusative plural', { grammaticalCase: GrammaticalCase.ACC, number: Number.PLURAL })
addForm('accanpl', 'accusative animate plural', { grammaticalCase: GrammaticalCase.ACC, animate: Animateness.ANIMATE, number: Number.PLURAL })
addForm('accinanpl', 'accusative inanimate plural', { grammaticalCase: GrammaticalCase.ACC, animate: Animateness.INANIMATE, number: Number.PLURAL })
addForm('accinanfpl', 'accusative femininate inanimate plural', { grammaticalCase: GrammaticalCase.ACC, gender: Gender.F, animate: Animateness.INANIMATE, number: Number.PLURAL })

addForm('instrpl', 'instrumental plural', { grammaticalCase: GrammaticalCase.INSTR, number: Number.PLURAL })
addForm('preppl', 'prepositional plural', { grammaticalCase: GrammaticalCase.PREP, number: Number.PLURAL })

addForm('genplalt', 'genitive plural alternative form', { grammaticalCase: GrammaticalCase.GEN, number: Number.PLURAL })
addForm('datplalt', 'dative plural alternative form', { grammaticalCase: GrammaticalCase.DAT, number: Number.PLURAL })
addForm('accplalt', 'accusative plural alternative form', { grammaticalCase: GrammaticalCase.ACC, number: Number.PLURAL })
addForm('instrplalt', 'instrumental plural alternative form', { grammaticalCase: GrammaticalCase.INSTR, number: Number.PLURAL })
addForm('prepplalt', 'prepositional plural alternative form', { grammaticalCase: GrammaticalCase.PREP, number: Number.PLURAL })

addForm('genalt', 'genitive plural alternative form', { grammaticalCase: GrammaticalCase.GEN, number: Number.PLURAL })
addForm('datalt', 'dative plural alternative form', { grammaticalCase: GrammaticalCase.DAT, number: Number.PLURAL })
addForm('accalt', 'accusative plural alternative form', { grammaticalCase: GrammaticalCase.ACC, number: Number.PLURAL })
addForm('instralt', 'instrumental plural alternative form', { grammaticalCase: GrammaticalCase.INSTR, number: Number.PLURAL })
addForm('prepalt', 'prepositional plural alternative form', { grammaticalCase: GrammaticalCase.PREP, number: Number.PLURAL })

addForm('adv', 'adverb', { pos: PartOfSpeech.ADVERB })
addForm('comp', 'comparative', { comparison: Comparison.COMPARATIVE })

addForm('shortf', 'short form feminine', { gender: Gender.F, number: Number.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortn', 'short form neuter', { gender: Gender.N, number: Number.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortm', 'short form masculine', { gender: Gender.M, number: Number.SINGULAR, adjectiveForm: AdjectiveForm.SHORT })
addForm('shortpl', 'short form plural', { number: Number.PLURAL, adjectiveForm: AdjectiveForm.SHORT })

addForm('alt', 'alternative form', {})
addForm('alt2', 'alternative form', {})
addForm('std', 'standard form', {})

export function getFormName(formId: string) {
    
    let form = FORMS[formId]

    if (form) {
        return form.name
    }
    else {
        console.warn('Unknown form ' + formId + '.')

        return formId
    }
}

export const INFLECTION_FORMS : { [s: string]: { [s: string]: Forms } } = {
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
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep', 'loc' ],
            [
                ['nom','pl'],
                ['gen','genpl'],
                ['dat','datpl'],
                ['acc','accpl'],
                ['instr','instrpl'],
                ['prep','preppl'],
                ['loc', 'locpl']
            ]),
        num: new Forms(
            [ 'm sg', 'n sg', 'f sg', 'plural' ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [
                ['m','n','f', [ 'pl', 'fpl' ]],
                ['genm','genn','genf','genpl'],
                ['datm','datn','datf','datpl'],
                [ [ 'accinanm', 'accanm' ], 'accn', 'accf', [ 'accinanpl', 'accinanfpl', 'accanpl' ]],
                ['instrm','instrn','instrf','instrpl'],
                ['prepm','prepn','prepf','preppl'],
            ]),
        prep: new Forms(
            [ ], 
            [ ],
            [ [ 'std', 'alt', 'alt2' ] ]
        ),
        case: new Forms(
            [ ],
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [ ['nom', 'nomalt'], ['gen', 'genalt'], ['dat', 'datalt'], ['acc', 'accalt'], ['instr', 'instralt'], ['prep', 'prepalt'] ]
        ),
        pron: new Forms(
            [ 'singular', 'plural' ], 
            [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            [        
                [ [ 'nom', 'nomalt'], [ 'pl', 'plalt' ]],
                [ [ 'gen', 'genalt'], [ 'genpl', 'genplalt' ]],
                [ [ 'dat', 'datalt'], [ 'datpl', 'datplalt' ]],
                [ [ 'acc', 'accalt'], [ 'accpl', 'accplalt' ]],
                [ [ 'instr', 'instralt'], [ 'instrpl', 'instrplalt' ]],
                [ [ 'prep', 'prepalt'], [ 'preppl', 'prepplalt' ]]
            ])
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