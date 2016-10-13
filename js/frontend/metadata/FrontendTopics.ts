
import { handleException } from '../xr';
import xr from '../xr';

import { Topic, Topics, SerializedTopic } from '../../shared/metadata/Topics'
import AbstractTopic from '../../shared/metadata/AbstractTopic'
import Fact from '../../shared/fact/Fact'
import Facts from '../../shared/fact/Facts'

export default class FrontendTopics implements Topics {
    all: Map<string, Topic>
    topicsByFact: Map<string, Topic[]> = new Map()

    constructor(public xrArgs: { [name: string]: string}, public lang: string, public facts: Facts) {
        this.xrArgs = xrArgs
        this.lang = lang
        this.facts = facts
    }

    internalSetTopic(topic: Topic) {
        this.all.set(topic.id, topic)

        this.topicsByFact = null
    }

    storeTopic(topic: Topic) {
        return xr.put(`/api/${ this.lang }/topic/` + topic.id, topic.serialize(), this.xrArgs)
                .catch(handleException)
                .then(() => topic)
    }

    setTopic(topic: Topic) {
        if (!this.all.has(topic.id)) {
            throw new Error('Non-existing topic.')
        }

        this.internalSetTopic(topic)

        return this.storeTopic(topic)
    }

    addTopic(id: string) {
        if (this.all.has(id)) {
            throw new Error('ID exists.')
        }

        let topic = new FrontendTopic(
            { id: id, name: '', description: '', facts: [] }, this)

        this.internalSetTopic(topic)

        return this.storeTopic(topic)
    }

    getTopic(id: string): Promise<Topic> {
        return this.getAll().then(all => 
            this.all.get(id))
    }

    getAll(): Promise<Topic[]> {
        if (this.all) {
            return Promise.resolve(Array.from(this.all.values()))
        }
        else {
            return xr.get(`/api/${ this.lang }/topic`, {}, this.xrArgs)
            .then(response => {
                this.all = new Map()

                response.data.forEach(serialized => {
                    let topic = new FrontendTopic(serialized, this)

                    this.internalSetTopic(topic)
                })

                return this.getAll()
            })
            .catch(handleException)
        }
    }

    getTopicsOfFact(fact: Fact): Promise<Topic[]> {
        return this.getAll().then((all) => {
            if (!this.topicsByFact) {
                for (let topic of all) {
                    topic.getFacts().forEach(f => {
                        let topics = this.topicsByFact.get(f.getId())

                        if (!topics) {
                            topics = []

                            this.topicsByFact.set(f.getId(), topics)
                        }

                        topics.push(topic)
                    })
                }
            }

            return this.topicsByFact.get(fact.getId()) || []
        })
    }
}

class FrontendTopic extends AbstractTopic {
    constructor(topic: SerializedTopic, public topics: FrontendTopics) {
        super(topic, topics.facts)
    }

    addFact(fact: Fact) {
        super.addFact(fact)

        this.topics.setTopic(this)
    }

    removeFact(fact: Fact) {
        super.removeFact(fact)

        this.topics.setTopic(this)
    }
}