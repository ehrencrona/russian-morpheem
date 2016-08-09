const pl = (form) => form.substr(form.length-2) == 'pl'
const sg = (form) => form.substr(form.length-2) != 'pl'

const MASKS = {
    adj: {
        short: (form) => form.substr(0, 5) == 'short',
        shortandadv: (form) => form.substr(0, 5) == 'short' || form == 'adv',
        nonstd: (form) => form.substr(0, 5) == 'short' || form == 'adv' || form == 'comp',
        pl: pl,
        sg: (form) => form.substr(form.length-2) != 'pl' && form != 'adv' && form != 'comp',
        adv: (form) => form == 'adv',
        comp: (form) => form == 'comp',
        allbutcomp: (form) => form != 'comp',
        allbutshort: (form) => form.substr(0, 5) != 'short',
        allbutpl: (form) => !pl(form),
        allbutadv: (form) => form != 'adv',
        allbutplandadv: (form) => !pl(form) && form != 'adv'
    },
    num: {
        pl: pl,
        sg: sg
    },
    n: {
        pl: pl,
        sg: sg
    },
    v: {
        pl: pl,
        sg: (form) => form.substr(form.length-2) != 'pl' && form != 'inf',
        past: (form) => form.substr(0, 4) == 'past',
        impr: (form) => form.substr(0, 4) == 'impr',
        non_impr: (form) => form.substr(0, 4) !== 'impr'
    }
}

export default MASKS