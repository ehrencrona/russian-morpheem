import Progress from '../../shared/study/Progress';

import { handleException } from '../xr';
import xr from '../xr';

import Exposure from '../../shared/study/Exposure'
import Exposures from '../../shared/study/Exposures'

export default class FrontendExposures implements Exposures {
    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    registerExposures(exposures: Exposure[]): Promise<any> {
        return xr.post(`/api/${ this.lang }/exposure`, exposures, this.xrArgs)
        .catch(handleException)
    }

    getExposures(userId: number): Promise<Exposure[]> {
        return xr.get(`/api/${ this.lang }/exposure`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data.map(e => convertDate(e, 'time')) as Exposure[]
        })
        .catch(handleException)
    }

    getExposuresOfFact(factId: string, userId: number): Promise<Exposure[]> {
        throw new Error('Unsupported')
    }

    storeProgress(progress: Progress, userId: number) {
        return xr.post(`/api/${ this.lang }/progress`, progress, this.xrArgs)
        .catch(handleException)
    }

    getProgress(userId: number): Promise<Progress[]> {
        return xr.get(`/api/${ this.lang }/progress`, {}, this.xrArgs)
        .then((xhr) => {
            return xhr.data.map(p => convertDate(p, 'date')) as Progress[]
        })
        .catch(handleException)
    }
}

function convertDate(entry, property: string) {
    entry[property] = new Date(entry[property])

    return entry
}