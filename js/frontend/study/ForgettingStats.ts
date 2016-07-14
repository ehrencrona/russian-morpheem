
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import Fact from '../../shared/fact/Fact'
import Corpus from '../../shared/Corpus'

interface FactStats {
    exposureCount: number,
    lastExposure: Date
}

interface IntervalStats {
    known: number,
    unknown: number
}

type StatsForRepetition = IntervalStats[];

const MAX_REP = 16
const MAX_INTERVAL = 7

export default class ForgettingStats {

    factFilter: (fact: Fact) => boolean = (fact) => true

    intervals: StatsForRepetition[] = []
    factStatsById: { [id: string] : FactStats} = {}

    constructor(public corpus: Corpus) {
        this.corpus = corpus

        for (let i = 0; i < MAX_REP; i++) {
            let statsForRep: StatsForRepetition = []

            for (let i = 0; i <= MAX_INTERVAL; i++) {
                statsForRep.push({ known: 0, unknown: 0})
            }

            this.intervals.push(statsForRep)
        }
    }

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure: Exposure) => {

            if (exposure.skill != Skill.PRODUCTION) {
                return
            }

            let fact = this.corpus.facts.get(exposure.fact)

            if (!fact || !this.factFilter(fact)) {
                return
            }

            let stats = this.factStatsById[exposure.fact]

            if (!stats) {
                if (exposure.knew == Knowledge.DIDNT_KNOW) {
                    stats = {
                        exposureCount: 1,
                        lastExposure: exposure.time
                    }

                    this.factStatsById[exposure.fact] = stats
                }
            }
            else {
                let timeSince = exposure.time.getTime() - stats.lastExposure.getTime()

                if (timeSince < 0) {
                    console.warn(`Time is going backwards, from ${ stats.lastExposure } to  ${ exposure.time }.`)
                    return
                }

                let interval = Math.round(Math.log(Math.max(timeSince / 1000 / 2, 1)))

                if (interval > MAX_INTERVAL) {
                    interval = MAX_INTERVAL
                }

                let exposureCount = Math.floor((Math.min(stats.exposureCount, MAX_REP)-1) / 2)

                let stat = this.intervals[exposureCount][interval]

                if (exposure.knew == Knowledge.KNEW) {
                    stat.known++
                }
                else if (exposure.knew == Knowledge.DIDNT_KNOW) {
                    stat.unknown++
                }

                stats.exposureCount++
                stats.lastExposure = exposure.time                
            }

        })

    }

    print() {

        this.intervals.forEach((interval, index ) => {
            console.log(`${index+1}: ` + interval.map((stat) => {

                if (!stat.known && !stat.unknown) {
                    return ''
                }

                return Math.round(stat.known / (stat.known + stat.unknown) * 100) + `% (${stat.known + stat.unknown})`

            }))
        })

    }
} 