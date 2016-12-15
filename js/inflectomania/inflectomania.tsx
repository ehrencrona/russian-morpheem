import { Z_STREAM_ERROR } from 'zlib';
/// <reference path="../../typings/index.d.ts" />

import { Component, cloneElement, createElement } from 'react';
import { render } from 'react-dom'

let React = { createElement: createElement }

function renderIntoId(component, elementId) {
    var element = document.getElementById(elementId);

    if (element) {
        render((
            component
            ),
            element
        );
    }
}

interface Props {
}

interface State {
}

interface Context {
    subject: Noun, 
    object: Noun
    position: number
}

class Word {
    constructor(public en: string) {
    }

    getForm(context: Context) {
        return this.en
    }

    getRuForm(context: Context) {
        return this.en
    }

    getTransliteration(context: Context) {
        return this.en
    }

    render(context: Context) {
        let text = this.getForm(context)

        if (context.position == 0) {
            text = capitalize(text)
        }

        return <div className='word' key={ context.position }><div>{ text }{ context.position == 3 ? '.' : '' }</div></div>
    }

    renderRu(context: Context) {
        let text = this.getRuForm(context)

        if (context.position == 0) {
            text = capitalize(text)
        }

        return <div className='word' key={ context.position }>
            <div>{ text }{ context.position == 3 ? '.' : '' }
                <div className='transliteration'>{ this.getTransliteration(context) }</div>
            </div>
        </div>
    }
}

class Noun extends Word {
    constructor(en: string, public gender: Gender, public number: Number, public animate: Animate,
            public ru: string[], public transliteration: string[]) {
        super(en)
    }

    getTransliteration(context: Context) {
        return this.transliteration[context.position] || ''
    }

    getRuForm(context: Context) {
        return this.ru[context.position] || ''
    }
}

enum Animate {
    ANIMATE, INANIMATE
}

enum Gender {
    M, F
}

enum Number {
    SG, PL
}

const SASHA = new Noun('Sasha', Gender.M, Number.SG, Animate.ANIMATE, 
    [ 'Саша', '', 'Сашу', 'Сашей'], [ 'Sasha', '', 'Sashu', 'Sashey'])
const MASHA = new Noun('Masha', Gender.F, Number.SG, Animate.ANIMATE, 
    [ 'Маша', '', 'Машу', 'Машей'], [ 'Masha', '', 'Mashu', 'Mashey'])
const DASHA = new Noun('Dasha', Gender.F, Number.SG, Animate.ANIMATE, 
    [ 'Даша', '', 'Дашу', 'Дашей'], [ 'Dasha', '', 'Dashu', 'Dashey'])

const NOUNS1 = [
    new Noun('my mother', Gender.F, Number.SG, Animate.ANIMATE, 
        [ 'моя мать', '', 'мою мать', 'моей матерью' ], 
        [ 'moya mat\'', '', 'moyu mat\'', 'moyey mater\'yu']),
    new Noun('my parrot', Gender.M, Number.SG, Animate.INANIMATE, 
        [ 'мой попугай', '', 'моего попугая', 'моим попугаем' ],
        [ 'moy popugay', '', 'moyego popugaya', 'moim popugayem' ]),
    new Noun('my bird', Gender.F, Number.SG, Animate.INANIMATE, 
        [ 'моя птица', '', 'мою птицу', 'моей птицей' ],
        [ 'moya ptitsa', '', 'moyu ptitsu', 'moyey ptitsey'])
]

const NOUNS2 = [
    new Noun('my parrots', Gender.M, Number.PL, Animate.INANIMATE, 
        [ 'мои попугаи', '', 'моих попугаев', 'моми попугаями' ],
        [ 'moi popugai', '', 'moikh popugayev',	'moimi popugayami' ]),
    new Noun('my three parrots', Gender.M, Number.PL, Animate.INANIMATE, 
        [ 'мои три попугая', '', 'моих трёх попугаев', 'моими тремя попугаями' ],
        [ 'moi tri popugaya', '', 'moikh trokh popugayev', 'moimi tremya popugayami' ]),
    new Noun('my five parrots', Gender.M, Number.PL, Animate.INANIMATE, 
        [ 'мои пять попугаев', '', 'моих пять попугаев', 'моими пятью попугаями'],
        [ 'moi pyat\' popugayev', '', 'moikh pyat\' popugayev', 'moimi pyat\'yu popugayami']),
    new Noun('my birds', Gender.F, Number.PL, Animate.INANIMATE, 
        [ 'мои птицы', '', 'моих птиц', 'моими птицами' ],
        [ 'moi ptitsy', '', 'moikh ptits', 'moimi ptitsami' ]),
    new Noun('my three birds', Gender.F, Number.PL, Animate.INANIMATE, 
        [ 'мои три птицы', '', 'моих три птицы', 'моими тремя птицами' ],
        [ 'moi tri ptitsy','', 'moikh tri ptitsy', 'moimi tremya ptitsami']),
    new Noun('my five birds', Gender.F, Number.PL, Animate.INANIMATE, 
        [ 'мои пять птиц', '', 'моих пять птиц', 'моими пятью птицами'],
        [ 'moi pyat\' ptits', '', 'moikh pyat\' ptits', 'moimi pyat\'yu ptitsami' ]),

    new Noun('my children', Gender.F, Number.PL, Animate.ANIMATE, 
        [ 'мои дети', '', 'моих детей', 'моими детьми' ],
        [ 'moi deti', '', 'moikh detey', 'moimi det\'mi' ]),
    new Noun('my three children', Gender.F, Number.PL, Animate.ANIMATE, 
        [ 'мои три ребёнка', '', 'моих три ребёнка', 'моими тремя детьми' ],
        [ 'moi tri rebonka', '', 'moikh tri rebonka', 'moimi tremya det\'mi' ]),
    new Noun('my five children', Gender.F, Number.PL, Animate.ANIMATE, 
        [ 'мои пять детей', '', 'моих пять детей', 'моими пятью детьми' ],
        [ 'moi pyat\' detey', '', 'moikh pyat\' detey', 'moimi pyat\'yu det\'mi' ])
]

class ToCall extends Word {
    constructor() {
        super('calls')
    }

    getForm(context: Context) {
        return 'called'
    }

    getTransliteration(context: Context) {
        return context.subject.number == Number.PL ?
            'nazvaly' :
            (context.subject.gender == Gender.F ?
                'nazvala' :
                'nazval')       
    }

    getRuForm(context: Context) {
        return context.subject.number == Number.PL ?
            'назвали' :
            (context.subject.gender == Gender.F ?
                'назвала' :
                'назвал')       
    }
}

class InflectoMania extends Component<Props, { words: Word[] }> {
    constructor() {
        super()

        this.state = {
            words: [
                SASHA,
                new ToCall(),
                MASHA,
                DASHA
            ]
        }
    }

    componentDidMount() {
        let anchor = document.getElementById('scroller-anchor')
        let scroller = document.getElementById('scroller')
        let placeholder = document.getElementById('scroller-placeholder')

        var move = function() {
            var st = window.scrollY;
            var ot = anchor.offsetTop;

            if (st > ot) {
                scroller.style.position = "fixed"
                scroller.style.top = "0px"

                placeholder.style.display = 'block';
                placeholder.style.height = scroller.clientHeight + 'px';

                scroller.className += ' floating'
            } 
            else {
                if (st <= ot) {
                    scroller.style.position = "relative"
                    scroller.style.top = ""

                    placeholder.style.display = 'none';
                    scroller.className = scroller.className.replace('floating', '')
                }
            }
        };

        window.onscroll = move;

        move();
    }

    render() {
        let context: Context = {
            position: 0,
            subject: this.state.words[0] as Noun,
            object: this.state.words[2] as Noun
        }

        return <div>
            <h2>
                Considering learning Russian?
            </h2>

            <h4>
                Before you do, you should know what you're getting into. 
                
                Let's build a simple sentence:
            </h4>

            <div id='scroller-anchor'/>
            <div id='scroller-placeholder'>&nbsp;</div>
            <div id='scroller'>
                <div className='sentence en'>
                    {
                        this.state.words.map((w, i) => {
                            context.position = i
                            
                            return w.render(context)
                        })
                    }
                </div>
                <div className='sentence ru'>
                    {
                        this.state.words.map((w, i) => {
                            context.position = i
                            
                            return w.renderRu(context)
                        })
                    }
                </div>
            </div>

            <h4>
                Easy, no? Yes, Masha, Dasha and Sasha are all common names. 
            </h4>

            <h4>
                Hey, why does the name look different every time?

                Well, that's because of something called cases. 
                The same stuff people hate in German, only Russian has more of them. 
            </h4>

            <h4>                
                It gets worse. Click one of these buttons to select another person to do the calling:
            </h4>

            <div className='nouns'>{
                NOUNS1.map((n, i) => {
                    context.position = i

                    return <div className='noun' key={ n.en } onClick={ () => {
                        let words = this.state.words.slice(0)
                        words[0] = n
                        this.setState({ words: words })

                        ga('send', 'event', 'inflectomania', 'noun')
                    } }>{ 
                        n.render(context) 
                    }</div>
                })
            }</div>

            <h4>
                Funny, "my" looks different all the time. And the verb keeps changing. 
                What happens if we move the word you added? 
            </h4>

            <div className='switches'>

                <div className='switch1' onClick={ () => {
                        let words = this.state.words.slice(0);

                        [ words[0], words[2] ] = [ words[2], words[0] ]

                        this.setState({ words: words })

                        ga('send', 'event', 'inflectomania', 'switch')
                    }
                }>
                    <img src='/img/swap2.svg'/>
                </div>

                <div className='switch2' onClick={ () => {
                        let words = this.state.words.slice(0);

                        [ words[2], words[3] ] = [ words[3], words[2] ]

                        this.setState({ words: words })

                        ga('send', 'event', 'inflectomania', 'switch')
                    }
                }>
                    <img src='/img/swap.svg'/>
                </div>
            </div>

            <h4>
                Hm, somehow the nine combinations of nouns and positions all have different endings...
            </h4>

            <h4>
                Oh, and six new ways to say "my". 
                We'll look at the remaining 19 later. 
            </h4>

            <h4> 
                Oh, you're still here? Maybe you want to try forming the plural?
            </h4>

            <div className='nouns'>{
                NOUNS2.map((n, i) => {
                    context.position = i

                    return <div className='noun' key={ n.en } onClick={ () => {
                        let words = this.state.words.slice(0)
                        words[0] = n
                        this.setState({ words: words })
                        ga('send', 'event', 'inflectomania', 'noun')
                    } }>{ 
                        n.render(context) 
                    }</div>
                })
            }</div>

            <h4>
                Whoa, "birds", "two birds", and "five birds" all render the word "bird" differently. 
                That's before you start moving them around. 
            </h4>
            <h4>
                "Three children" using a different word for "children" is not a typo.
            </h4>

            <h4>
                Does memorizing this look like fun? You should study Russian!
            </h4>

            <div className='finishup'>
                <hr/>
                <p>
                    Oh, and in case you're wondering:
                </p>
                <p>
                    The first word is in the nominative case (the form you'd find in a dictionary), 
                    the third word is in the <a href='https://russian.morpheem.com/form/accusative'>accusative case</a> because 
                    it is a direct object (directly follows the noun without a preposition).
                </p>
                <p>
                    The last word is in the <a href='https://russian.morpheem.com/form/instrumental'>instrumental case</a> because
                    it is often used when someone is/becomes/is called something.
                </p>
                <p>
                    In the <a href='https://russian.morpheem.com/form/past'>past tense</a>, you use different forms of the verb 
                    depending on whether the subject is male, female, neuter or several people.
                </p>
                <p>
                    Here's <a href='https://russian.morpheem.com/word/%D0%BC%D0%BE%D0%B9#inflections'>the full list of inflections of "my"</a>. 
                    Yes, it's unusually irregular. We're trying to make a point.
                </p>
                <p>
                    When saying <a href='https://russian.morpheem.com/phrase/234-gen'>two, three or four of something</a>, you use the <a href='https://russian.morpheem.com/form/gen'>genitive singular</a>, 
                    but when there are <a href='https://russian.morpheem.com/phrase/567-genpl'>more than that</a>, it's the <a href='https://russian.morpheem.com/form/genpl'>genitive plural</a>, for obscure historical reasons. 
                    But when talking about an unspecified number, it's just the standard <a href='https://russian.morpheem.com/form/pl'>nominative plural</a>.
                </p>
                <p>
                    Oh, did we mention that "to call" changes if you call people something <a href='https://russian.morpheem.com/words/imperf'>regularly</a> as opposed to only one time.
                </p>
                <p>
                    Fun.
                </p>
                <p></p>
            </div>
        </div>
    }

}

renderIntoId(
    <InflectoMania/>,
    'react-inflectomania'
)


function capitalize(str: string) {
    return str[0].toUpperCase() + str.substr(1)
}