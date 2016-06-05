import * as express from 'express'

export default function getAuthor(req: express.Request) {
    if (req.user && req.user.sub) {
        return req.user.sub.split('|')[1]
    }
}
