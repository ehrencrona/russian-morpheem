
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'

const CLASSES = 4

let poses = {
    'quest': [ 'где', 'как', 'зачем', 'почему', 'когда', 'куда', 'откуда'], 
    'prep': ['на', 'под', 'перед', 'от', 'за', 'у', 'без', 'для', 'по', 'из', 'после', 'про', 'до', 'через', 'потом', 'вокруг', 'между', 'прямо', 'кроме', 'рядом', 'против', 'около', 'среди', 'напротив', 'из-за', 'из-за[from behind]', 'при', 'над', 'вовремя'],
    'conj': ['что[that]', 'как[when]', 'как[like]', 'или', 'но', 'если', 'чтобы', 'тогда', 'поэтому', 'либо', 'впрочем', 'чем'], 
    'adv': ['дома', 'очень', 'слишком', 'нужно', 'только', 'можно', 'нельзя', 'уже', 'ещё', 'ещё[again]', 'по-французски', 'по-английски', 'по-русски', 'тоже', 'мало', 'направо', 'налево', 'раньше', 'всегда', 'иногда', 'чуть-чуть', 'надо', 'давно', 'недавно', 'совсем', 'вроде', 'снова', 'опять', 'вместе', 'наверное', 'пешком', 'столько', 'недалеко', 'дальше', 'вверх', 'почти', 'вниз', 'вдруг', 'однако', 'сразу', 'наконец', 'словно', 'точно', 'действительно', 'ладно', 'слева', 'справа', 'недостаточно', 'неважно', 'невкусно', 'невысоко'],
    'n': ['радио', 'кофе', 'такси', 'метро', 'кино', 'кино[film]', 'кафе', 'меню'], 
    'pronouns': ['его', 'её', 'что-то', 'их', 'оно']
}

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    Object.keys(poses).forEach((pos) => {

        poses[pos].forEach((wordId) => {
            (corpus.facts.get(wordId) as Word).pos = pos
        })

    })

    writeFactFile('facts.txt', corpus.facts)
})
.catch((e) => console.log(e.stack))
