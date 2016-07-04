import * as express from 'express'

interface Author {
    numericalId: number,
    name: string,
    slack?: {
        name: string,
        id: string
    }
}

const AUTHORS: { [id:string] : Author } = {
    '574ee8e94b8e1813649d514d': { numericalId: 0, name: 'sergei', slack: { name: 'sergei', id: 'U1CHPA789' }},
    '574dba05ef4942c9629eba15': { numericalId: 1, name: 'pasha', slack: { name: 'pasha', id: 'U09BSN46Q' }},
    '574d8c232a7eb77e6954e56a': { numericalId: 2, name: 'andreas', slack: { name: 'andreas', id: 'U1CHA7FH6' }},
    '5757e7500f0823ad185bfbaa': { numericalId: 3, name: 'mark', slack: { name: 'swisslearner', id: 'U1F3322MS'}},
    '575d768aaab86c9b292466f6': { numericalId: 4, name: 'roman', slack: { name: 'mttex', id: 'U1G61DEER' }},
    '575ad452aab86c9b292433f7': { numericalId: 5, name: 'phaina', slack: { name: 'anphisa', id: 'U1FSERRK8' }},
    '575bd929aab86c9b29244929': { numericalId: 6, name: 'adam', slack: { name: 'agjohnst', id: 'U1G5WLATV' }},
    '575e581bc7128f622cabe9c3': { numericalId: 7, name: 'alexey' },
    '57600b40fed5bb9c12fd2f43': { numericalId: 8, name: 'will', slack: { name: 'willhaughton', id: 'U1GP3FN85' }},
    '5765156738fcbd5b47b17a93': {
        numericalId: 9,
        name: 'eoghan'
    },
    '5770d4aa0096f1396ff7f740': {
        numericalId: 10,
        name: 'kees'
    },
    '57767c6a934728da6af8ea09': {
        numericalId: 11,
        name: 'ian'
    },
    '5778d1a0d81e492529d42c22': {
        numericalId: 12,
        name: 'ctane@reddit'
    },
    '5778d276d81e492529d42c34': {
        numericalId: 13,
        name: 'mai'
    }
    
}

export function getSlackOfAuthor(authorName: string): { name: string, id: string } {
    let authorId = Object.keys(AUTHORS).find((authorId) => 
        AUTHORS[authorId].name == authorName
    )

    if (!authorId) {
        return null
    }

    return AUTHORS[authorId].slack
}

export default function getAuthor(req: express.Request): Author {
    let result: Author

    if (req.user && req.user.sub) {
        let id = req.user.sub.split('|')[1]

        result = AUTHORS[id]

        if (!result) {
            result = {
                numericalId: parseInt(id, 16),
                name: id
            }
        }
    }
    else {
        result = {
            numericalId: 4711,
            name: 'Not authenticated'
        }
    }

    return result
}

export function getAllAuthors(): string[] {
    return Object.keys(AUTHORS).map((id) => AUTHORS[id].name)
}