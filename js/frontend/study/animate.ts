
export default function animate(element: HTMLElement, className: string, length: number, callback?: () => any) {
    let ended = false;

    let done = () => {
        if (ended) {
            return
        }

        ended = true

        element.classList.remove(className)

        if (callback) {
            callback()
        }
    }

    element.addEventListener('animationend', done)
    element.classList.add(className)

    setTimeout(done, 1.5 * length)
}   
