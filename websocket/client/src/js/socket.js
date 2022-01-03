
const kEvents = Symbol("kEvents")
const kAttachEvents = Symbol("kAttachEvents")
export default class Socket {
    /**
     * @type {WebSocket}
     */
    raw
    isConnected = false
    isConnecting = false

    /**
     * 
     * @param {string} url 
     * @param {string} protocol
     */
    constructor(url, protocol) {
        this.url = url
        this.protocol = protocol
        this[kEvents] = new Map()
    }

    async connect() {
        if (this.isConnecting || this.isConnected) return;

        return new Promise((resolve, reject) => {
            this.raw = new WebSocket(this.url, this.protocol)

            this.raw.onerror = e => {
                reject("Error during the connection!")
            }

            this.raw.onopen = (e) => {
                this.isConnected = true
                this.isConnecting = false
                this[kAttachEvents]()
                resolve()
            }
        })
    }

    [kAttachEvents]() {
        this.raw.onmessage = (e) => {
            let { event, message } = JSON.parse(e.data)
            message = message.map((m, i) => m == `${event}::callback:${i}` ? (...args) => { this.emit(m, ...args) } : m)

            const eventFn = this[kEvents].get(event) || function () { }
            eventFn(...message)
        }

        this.raw.onerror = (e) => {
            console.error("error on socket", e)
        }

        this.raw.onclose = (e) => {
            this.isConnected = false
        }
    }

    /**
  * Handle a event
  * @param {string} event 
  * @param {(...args) => void} fn
  */
    on(event, fn) {
        this[kEvents].set(event, fn)
        return this
    }

    /**
     * Handle a event once time
     * @param {string} event 
     * @param {(...args) => void} fn
     */
    once(event, fn) {
        this[kEvents].set(event, (...args) => {
            fn(...args)
            this[kEvents].delete(event)
        })

        return this
    }

    /**
     * Emit a event to the server
     * @param {string} event 
     */
    emit(event, ...args) {
        // This allows callback functions between the client and server
        args = args.map((m, i) => {
            if (typeof m == 'function') {
                const callbackEvent = `${event}::callback:${i}`
                this.once(callbackEvent, (message) => { m(message) })
                return callbackEvent
            }
            return m
        })

        this.raw.send(JSON.stringify({ event, message: args }))
        return this
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        this.raw.close()
        return this
    }
}