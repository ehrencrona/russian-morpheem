
import StudentProfile from '../../shared/study/StudentProfile'
import { StudyPlan, SerializedStudyPlan, StudiedFacts } from '../../shared/study/StudyPlan'
import AbstractStudyPlan from '../../shared/study/AbstractStudyPlan'
import Fact from '../../shared/fact/Fact'
import Facts from '../../shared/fact/Facts'
import Corpus from '../../shared/Corpus'

const url = 'mongodb://localhost:27017/study';
const COLLECTION = 'studyplan'
import { MongoClient, MongoError, Db, Cursor } from 'mongodb'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'

const HOUR_MS = 60 * 60 * 1000;

const EXPIRY_TIME_MS = 12 * HOUR_MS;
const RENEWAL_TIME_MS = 2 * HOUR_MS;

let db: Db

MongoClient.connect(url, function(err, connectedDb) {
    if (err) {
        console.error(err)
    }
    else {
        db = connectedDb
    }
});

class BackendStudyPlan extends AbstractStudyPlan {
    studied: StudiedFacts
    queued: Fact[]

    constructor(studyPlan: SerializedStudyPlan, public userId: number, corpus: Corpus) {
        super(studyPlan, corpus)

        this.userId = userId
    }

    setFacts(facts: StudiedFacts, knowledge: FixedIntervalFactSelector) {
        super.setFacts(facts, knowledge)

        return this.store()
    }

    clear() {
        super.clear()

        return this.store()
    }

    queueFact(fact: Fact) {
        super.queueFact(fact)

        this.store()
    }

    store() {
        return new Promise((resolve, reject) => {
            let studyPlan = super.serialize()

            studyPlan.user = this.userId

            db.collection(COLLECTION).updateOne({ user: this.userId }, studyPlan, { upsert: true },
                (error, result) => {
                    if (error) {
                        console.error('While updating status: ', error)

                        reject(error)
                    }
                    else {
                        resolve()
                    }
                })
        })

    }
}

export function storePlan(plan: SerializedStudyPlan, userId: number, corpus: Corpus): Promise<any> {
    return new BackendStudyPlan(plan, userId, corpus).store()
}

export function fetchPlan(userId: number, corpus: Corpus): Promise<StudyPlan> {
    return new Promise((resolve, reject) => {
        db.collection(COLLECTION)
            .findOne({
                user: userId
            })
            .then(doc => {
                let studyPlan = doc as SerializedStudyPlan

                if (!doc.lastAccess || new Date().getTime() - doc.lastAccess.getTime() > EXPIRY_TIME_MS) {
                    doc = null
                }

                if (new Date().getTime() - doc.lastAccess.getTime() > RENEWAL_TIME_MS) {
                    doc.lastAccess = new Date();

                    db.collection(COLLECTION).updateOne({ user: userId }, doc,
                        (error, result) => {
                            if (error) {
                                console.error('While updating last access time: ', error)
                            }
                            else {
                                console.log('Updated last access time for ' + userId)
                            }
                        }
                    )
                }

                if (!doc) {
                    studyPlan = {
                        lastAccess: new Date(),
                        queued: [],
                        repeatedFacts: [],
                        newFacts: [],
                        originalExpectedRepetitions: 0
                    }
                }

                resolve(new BackendStudyPlan(studyPlan, userId, corpus))
            })
            .catch((e) => reject(e))
    })
}
