export default class Wait {

    constructor () {
    // initiate wait vars
        this.waitQueue = []
        this.waitTimer = false
        this.waitExecution = false
    }

    handle (func, milliseconds = false) {
    // handle wait
        this.waitQueue.push({
            'func': func,
            'timeout': milliseconds
        })

        if (!this.waitExecution) {
            this.next()
        }
    }

    next () {
    // execute next
        if (this.waitQueue.length > 0) {
            let c = this.waitQueue.shift()
            let f = c['func']
            let t = c['timeout']

            if (t !== false) {
                f()
                this.waitExecution = true
                this.waitTimer = setTimeout(() => {
                    this.next()
                }, t)
            } else {
                f()
                this.waitExecution = false
                this.next()
            }
        }
    }

}
