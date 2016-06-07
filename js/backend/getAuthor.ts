import * as express from 'express'

const MAPPING = {
    '574ee8e94b8e1813649d514d': 'sergei',
    '574dba05ef4942c9629eba15': 'pasha',
    '574d8c232a7eb77e6954e56a': 'andreas'
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