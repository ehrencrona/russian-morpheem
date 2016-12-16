
import Exposure from './Exposure'
import Progress from './Progress'

interface Exposures {

    registerExposures(exposures: Exposure[]): Promise<any>

    getExposuresOfFact(factId: string, userId: number): Promise<Exposure[]>

    getExposures(userId: number): Promise<Exposure[]>

    storeProgress(progress: Progress, userId: number) 

    getProgress(userId: number): Promise<Progress[]>

}

export default Exposures
