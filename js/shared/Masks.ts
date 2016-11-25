
import FORMS from './inflection/InflectionForms'
import { GrammarCase, GrammarNumber, PartOfSpeech as PoS } from './inflection/Dimensions'

const pl = (form) => form.substr(form.length-2) == 'pl'
const sg = (form) => FORMS[form].number == GrammarNumber.SINGULAR

let MASKS: { [pos: number] : { [maskId: string] : (string) => boolean } } = {}

MASKS[PoS.ADJECTIVE] = {
    short: (form) => form.substr(0, 5) == 'short',
    nonstd: (form) => form.substr(0, 5) == 'short' || form == 'comp',
    pl: pl,
    sg: sg,
    comp: (form) => form == 'comp',
    compandshort: (form) => form == 'comp' || form.substr(0, 5) == 'short',
    allbutcompandshort: (form) => !(form == 'comp' ||form.substr(0, 5) == 'short'),
    allbutnom: (form) => FORMS[form].grammaticalCase != GrammarCase.NOM,
    allbutcomp: (form) => form != 'comp',
    allbutshort: (form) => form.substr(0, 5) != 'short',
    allbutpl: (form) => !pl(form)
}

MASKS[PoS.NUMBER] = {
    pl: pl,
    sg: sg
}

MASKS[PoS.NOUN] = {
    pl: pl,
    sg: sg
}

MASKS[PoS.VERB] = {
    pl: pl,
    sg: (form) => form.substr(form.length-2) != 'pl' && form != 'inf',
    past: (form) => form.substr(0, 4) == 'past',
    impr: (form) => form.substr(0, 4) == 'impr',
    non_impr: (form) => form.substr(0, 4) !== 'impr',
    allbut3rdsg: (form) => form != '3' && form != 'pastn' && form != 'inf',
}

export default MASKS