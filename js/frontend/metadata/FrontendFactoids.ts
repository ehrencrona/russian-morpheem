
import { handleException } from '../xr';
import xr from '../xr';

import { Factoid, Factoids } from '../../shared/metadata/Factoids'
import Fact from '../../shared/fact/Fact'

export default class FrontendFactoids implements Factoids {
    all: Factoid[]

    constructor(public xrArgs: { [name: string]: string}, public lang: string) {
        this.xrArgs = xrArgs
        this.lang = lang
    }

    setFactoid(factoid: Factoid, fact: Fact) {
        this.all = this.all.filter(factoid => fact.getId() == factoid.fact)
        this.all.push(factoid)

        return xr.put(`/api/${ this.lang }/factoid/` + fact.getId(), factoid, this.xrArgs)
        .catch(handleException)
    }

    getFactoid(fact: Fact): Promise<Factoid> {
        return this.getAll().then(all => {
            return all.find(factoid => fact.getId() == factoid.fact)
        })
    }

    getAll(): Promise<Factoid[]> {
        if (this.all) {
            return Promise.resolve(this.all)
        }
        else {
            return xr.get(`/api/${ this.lang }/factoid`, {}, this.xrArgs)
            .then(all => {
                this.all = all

                return all
            })
            .catch(handleException)
        }
    }
}