
import Exposure from './Exposure'

interface Exposures {

    registerExposures(exposures: Exposure[]): Promise<any>

    getExposuresOfFact(factId: string, userId: number): Promise<Exposure[]>

    getExposures(userId: number): Promise<Exposure[]>

}

export default Exposures
