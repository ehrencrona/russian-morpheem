
export default function mapFind<T, V>(array: T[], mapFunction: (T) => V) {
    for (let i = 0; i < array.length; i++) {
        let v = mapFunction(array[i])

        if (v) {
            return v
        }
    }
}