
import Corpus from '../../shared/Corpus'
import StudentProfile from '../../shared/study/StudentProfile'

import { handleException } from '../xr';
import xr from '../xr';

import Fact from '../../shared/fact/Fact'
import { SerializedStudyPlan, StudiedFacts, StudyPlan } from '../../shared/study/StudyPlan'  
import AbstractStudyPlan from '../../shared/study/AbstractStudyPlan'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'

class FrontendStudyPlan extends AbstractStudyPlan {

    constructor(studyPlan: SerializedStudyPlan, corpus: Corpus, public xrArgs: { [arg: string] : string }) {
        super(studyPlan, corpus)

        this.xrArgs = xrArgs
    }

    setFacts(facts: StudiedFacts, knowledge: FixedIntervalFactSelector) {
        super.setFacts(facts, knowledge)

        return this.store()
    }

    clear() {
        super.clear()

        return this.store()
    }

    store() {
        return xr.put(`/api/user/plan`, this.serialize(), this.xrArgs)
            .catch(handleException)
    }

    queueFacts(facts: Fact[]) {
        super.queueFacts(facts)

        return xr.post(`/api/user/profile/queued-fact`, { facts: facts.map(f => f.getId()) }, this.xrArgs)
            .catch(handleException)
    }

}

export function fetchStudyPlan(corpus: Corpus, xrArgs: { [arg: string] : string }): Promise<StudyPlan> {

    return xr.get(`/api/user/profile`, {}, xrArgs)
        .then((xhr) => {
            return new FrontendStudyPlan(xhr.data as SerializedStudyPlan, corpus, xrArgs) 
        })
        .catch(handleException)

}
