import * as express from 'express'

interface Author {
    name: string,
    slack?: string
}

const AUTHORS: { [id:string] : Author } = {
    '574ee8e94b8e1813649d514d': { name: 'sergei', slack: 'haffa' },
    '574dba05ef4942c9629eba15': { name: 'pasha', slack: 'pasha' },
    '574d8c232a7eb77e6954e56a': { name: 'andreas', slack: 'andreas' },
    '5757e7500f0823ad185bfbaa': { name: 'mark', slack: 'swisslearner' },
    '575d768aaab86c9b292466f6': { name: 'roman', slack: 'mttex' },
    '575ad452aab86c9b292433f7': { name: 'phaina', slack: 'anphisa' },
    '575bd929aab86c9b29244929': { name: 'adam', slack: 'agjohnst' },
    '575e581bc7128f622cabe9c3': { name: 'alexey' },
    '57600b40fed5bb9c12fd2f43': { name: 'will', slack: 'willhaughton' }
}

export function getSlackOfAuthor(authorName: string) {
    let authorId = Object.keys(AUTHORS).find((authorId) => 
        AUTHORS[authorId].name == authorName
    )

    if (!authorId) {
        return null
    }

    return AUTHORS[authorId].slack
}

export default function getAuthor(req: express.Request) {
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