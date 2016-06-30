/// <reference path="../../../typings/node-4.d.ts"/>
/// <reference path="../../../typings/redis.d.ts"/>

import { createReadStream, readFileSync } from 'fs'
import { createInterface } from 'readline'

import 'source-map-support/register'

import INFLECTION_FORMS from '../../shared/InflectionForms'

var lineReader = createInterface({
	input: createReadStream('data/dict.opcorpora.txt')
});

interface Word {
	pos: string,
	forms: { [s: string]: string }
}

let found = 0

var redis = require('node-redis')

let client = redis.createClient()

client.on('error', function (err) {
    console.log('Error ' + err);
})

client.on('ready', function (err) {
    console.log('connected');
})

let word: Word

let wordsByDefaultForm: { [ word: string ] : Word } = {}

let lineCount = 0

function resetWord() {
	word = {
		pos: null,
		forms: {}
	}
}

function wordEnded() {
	if (!INFLECTION_FORMS['ru'][word.pos]) {
		return
	}

	let defaultForm = INFLECTION_FORMS['ru'][word.pos].allForms[0]

	let existingWord = wordsByDefaultForm[defaultForm]

	if (existingWord) {
		if (word.pos != existingWord.pos) {
			console.log(defaultForm + ' exists twice: as ' + word.pos + 
				' and ' + existingWord.pos)
		}
	}
	else {
		wordsByDefaultForm[defaultForm] = word
	}

	let dictForm = word.forms[ defaultForm ]

	if (dictForm) {
		for (let form in word.forms) {
			client.hset(dictForm, form, word.forms[form])
		}

		client.hset(dictForm, 'pos', word.pos)					
		
		if (found++ % 10000 == 0) {
			console.log(found + '...')
		}
	}
	resetWord()
}

function foundForm(inflection: string, theirPos: string, theirForm: string) {
	let mapping = POS_MAPPING.find((mapping) => mapping[0] == theirPos)

	if (mapping) {
		let pos = mapping[1]

		if (word.pos && word.pos != pos) {
			resetWord()

			console.warn(`PoS changed from ${word.pos} to ${pos} on line ${lineCount}`)
		}
		
		word.pos = pos

		if (!EXCLUDE.find((term) => theirForm.indexOf(term) >= 0)) {				
			let formMapping = FORM_MAPPING[pos].find((mapping) => theirForm.indexOf(mapping[0]) >= 0)

			if (formMapping) {
				word.forms[formMapping[1]] = inflection.toLowerCase()
			}
		}
	}		
}

function applyErrata() {
	let errata = JSON.parse(readFileSync('data/dict.opcorpora.errata.json').toString())

	errata.forEach((erratum) => {
console.log(erratum)

		if (typeof erratum.dictWord != 'string' ||
			typeof erratum.form != 'string' ||
			typeof erratum.word != 'string') {
			console.error('Erratum', erratum, 'invalid.')
		}

		client.hset(erratum.dictWord, erratum.form, erratum.word)
	})
}

function importOpenCorpora() {
	resetWord()

	lineReader.on('line', (line) => {

		if (line == '' && word.pos) {
			if (!Object.keys(word.forms).length) {
				resetWord()
			}
			else if (!(word.pos == 'v' && !word.forms['inf'])) {
				wordEnded()
			}
		}

		let cols = line.split('\t')

		if (cols.length == 2) {
			let theirPos = cols[1].split(/[, ]/)[0]
			let inflection = cols[0]
			let theirForm = cols[1]

			foundForm(inflection, theirPos, theirForm)
		}
		
		lineCount++
	})

	lineReader.on('close', () => {
		if (!Object.keys(word.forms).length) {
			wordEnded()
		}

		console.log('done')
		client.quit();
		client.on('end', () => process.exit(0))
	})
}

applyErrata()

const POS_MAPPING = [
	[ 'NOUN', 'n' ],
	[ 'ADJF', 'adj' ],
	[ 'COMP', 'adj' ],
	[ 'VERB', 'v' ],
	[ 'INFN', 'v' ]
]

const EXCLUDE = [
	'V-oy',
	'V-ey',
	'Erro',
	'Dist',
	'Infr'
]

const FORM_MAPPING = {
	v: [
		['INFN', 'inf'],
		['sing,1per,pres', '1'],
		['plur,1per,pres', '1pl'],
		['sing,2per,pres', '2'],
		['plur,2per,pres', '2pl'],
		['sing,3per,pres', '3'],
		['plur,3per,pres', '3pl'],
		['sing,1per,futr', '1'],
		['plur,1per,futr', '1pl'],
		['sing,2per,futr', '2'],
		['plur,2per,futr', '2pl'],
		['sing,3per,futr', '3'],
		['plur,3per,futr', '3pl'],
		['masc,sing,past', 'pastm'],
		['femn,sing,past', 'pastf'],
		['sing,past,indc', 'pastn'],
		['plur,past,indc', 'pastpl'],
		['sing,impr,excl', 'impr'],
		['plur,impr,excl', 'imprpl'],
		['Qual masc,sing', 'shortm'],
		['Qual femn,sing', 'shortf'],
		['Qual plur', 'shortpl']
	], 
	
	adj: [
		['masc,sing,nomn', 'm'],
		['masc,sing,gent', 'genm'],
		['masc,sing,datv', 'datm'],
		['anim,masc,sing,accs', 'accanm'],
		['inan,masc,sing,accs', 'accinanm'],
		['masc,sing,ablt', 'instrm'],
		['masc,sing,loct', 'prepm'],
		['femn,sing,nomn', 'f'],
		['femn,sing,gent', 'genf'],
		['femn,sing,datv', 'datf'],
		['femn,sing,accs', 'accf'],
		['femn,sing,ablt', 'instrf'],
		['femn,sing,loct', 'prepf'],
		['neut,sing,nomn', 'n'],
		['neut,sing,gent', 'genn'],
		['neut,sing,datv', 'datn'],
		['neut,sing,accs', 'accn'],
		['neut,sing,ablt', 'instrn'],
		['neut,sing,loct', 'prepn'],
		['plur,nomn', 'pl'],
		['plur,gent', 'genpl'],
		['plur,datv', 'datpl'],
		['anim,plur,accs', 'accanpl'],
		['inan,plur,accs', 'accinanpl'],
		['plur,ablt', 'instrpl'],
		['plur,loct', 'preppl'],
		['COMP', 'comp']
	],
	
	n: [
		['sing,nomn', 'nom'],
		['sing,gent', 'gen'],
		['sing,datv', 'dat'],
		['sing,accs', 'acc'],
		['sing,ablt', 'instr'],
		['sing,loct', 'prep'],
		['plur,nomn', 'pl'],
		['plur,gent', 'genpl'],
		['plur,datv', 'datpl'],
		['plur,accs', 'accpl'],
		['plur,ablt', 'instrpl'],
		['plur,loct', 'preppl']		
	]
}



