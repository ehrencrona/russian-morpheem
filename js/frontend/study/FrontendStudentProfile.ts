
import Corpus from '../../shared/Corpus'
import StudentProfile from '../../shared/study/StudentProfile'

import { handleException } from '../xr';
import xr from '../xr';

import Fact from '../../shared/fact/Fact'
import { SerializedStudyPlan, StudiedFacts, StudyPlan } from '../../shared/study/StudyPlan'  
import AbstractStudyPlan from '../../shared/study/AbstractStudyPlan'

class FrontendStudyPlan extends AbstractStudyPlan {

    constructor(studyPlan: SerializedStudyPlan, corpus: Corpus, public xrArgs: { [arg: string] : string }) {
        super(studyPlan, corpus)

        this.xrArgs = xrArgs
    }

    setFacts(facts: StudiedFacts) {
        super.setFacts(facts)

        return xr.put(`/api/user/plan`, this.serialize(), this.xrArgs)
            .catch(handleException)
    }

    queueFact(fact: Fact) {
        super.queueFact(fact)

        return xr.post(`/api/user/profile/queued-fact`, { fact: fact.getId() }, this.xrArgs)
            .catch(handleException)
    }

}

export function fetchStudyPlan(corpus: Corpus, xrArgs: { [arg: string] : string }): Promise<StudyPlan> {

    return xr.get(`/api/user/profile`, {}, this.xrArgs)
        .then((xhr) => {
            return new FrontendStudyPlan(xhr.data as SerializedStudyPlan, corpus, xrArgs) 
        })
        .catch(handleException)

}
