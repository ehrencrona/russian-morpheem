const pl = (form) => form.substr(form.length-2) == 'pl'
const sg = (form) => form.substr(form.length-2) != 'pl'

const MASKS = {
    adj: {
        short: (form) => form.substr(0, 4) == 'short',
        pl: pl,
        sg: sg,
        adv: (form) => form == 'adv'
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