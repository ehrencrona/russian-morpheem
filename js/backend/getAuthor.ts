import * as express from 'express'

interface Author {
    name: string,
    slack?: {
        name: string,
        id: string
    }
}

const AUTHORS: { [id:string] : Author } = {
    '574ee8e94b8e1813649d514d': { name: 'sergei', slack: { name: 'sergei', id: 'U1CHPA789' }},
    '574dba05ef4942c9629eba15': { name: 'pasha', slack: { name: 'pasha', id: 'U09BSN46Q' }},
    '574d8c232a7eb77e6954e56a': { name: 'andreas', slack: { name: 'andreas', id: 'U1CHA7FH6' }},
    '5757e7500f0823ad185bfbaa': { name: 'mark', slack: { name: 'swisslearner', id: 'U1F3322MS'}},
    '575d768aaab86c9b292466f6': { name: 'roman', slack: { name: 'mttex', id: 'U1G61DEER' }},
    '575ad452aab86c9b292433f7': { name: 'phaina', slack: { name: 'anphisa', id: 'U1FSERRK8' }},
    '575bd929aab86c9b29244929': { name: 'adam', slack: { name: 'agjohnst', id: 'U1G5WLATV' }},
    '575e581bc7128f622cabe9c3': { name: 'alexey' },
    '57600b40fed5bb9c12fd2f43': { name: 'will', slack: { name: 'willhaughton', id: 'U1GP3FN85' }},
    '5765156738fcbd5b47b17a93': {
        name: 'eoghan'
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
    let result

    if (req.user && req.user.sub) {
        let id = req.user.sub.split('|')[1]

        result = AUTHORS[id]

        if (!result) {
            result = {
                name: id
            }
        }
    }
    else {
        result = {
            name: 'Not authenticated'
        }
    }

    return result
}

export function getAllAuthors(): string[] {
    return Object.keys(AUTHORS).map((id) => AUTHORS[id].name)
}