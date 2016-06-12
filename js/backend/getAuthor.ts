import * as express from 'express'

const MAPPING = {
    '574ee8e94b8e1813649d514d': 'sergei',
    '574dba05ef4942c9629eba15': 'pasha',
    '574d8c232a7eb77e6954e56a': 'andreas',
    '5757e7500f0823ad185bfbaa': 'mark',
    '575d768aaab86c9b292466f6': 'roman',
    '575ad452aab86c9b292433f7': 'phaina',
    '575bd929aab86c9b29244929': 'adam'
}

export default function getAuthor(req: express.Request) {
    if (req.user && req.user.sub) {
        let result = req.user.sub.split('|')[1]
        
        if (MAPPING[result]) {
            result = MAPPING[result]
        }
        
        return result
    }
}
