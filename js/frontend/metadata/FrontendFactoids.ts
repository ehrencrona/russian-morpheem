
import { handleException } from '../xr';
import xr from '../xr';

import { Factoid, Factoids } from '../../shared/metadata/Factoids'
import Fact from '../../shared/fact/Fact'

class FrontendFactoids implements Factoids {
    constructor(public all: Factoid[], public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
        this.all = all
    }

    setFactoid(factoid: Factoid, fact: Fact) {
        this.all = this.all.filter(factoid => fact.getId() != factoid.fact)
        this.all.push(factoid)

        if (!factoid.name) {
            delete factoid.name
        }

        return xr.put(`/api/${ this.lang }/factoid/` + fact.getId(), factoid, this.xrArgs)
        .catch(handleException)
    }

    getFactoidAsync(fact: Fact): Promise<Factoid> {
        return Promise.resolve(this.getFactoid(fact))
    }

    getFactoid(fact: Fact): Factoid {
        let result = this.all.find(factoid => fact.getId() == factoid.fact)
        
        if (!result) {
            result = {
                explanation: '',
                name: '',
                relations: [],
                fact: fact.getId()
            }
        }

        if (result.name === undefined) {
            result.name = ''
        }

        return result
    }

    getAll(): Promise<Factoid[]> {
        return Promise.resolve(this.all)
    }
}

export default function getFactoids(xrArgs: { [name: string]: string}, lang: string): Promise<Factoids> {
    return xr.get(`/api/${ lang }/factoid`, {}, xrArgs)
    .then(response => {
        this.all = response.data

        return new FrontendFactoids(this.all, xrArgs, lang)
    })
    .catch(handleException)

}