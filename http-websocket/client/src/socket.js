import http from 'http'
import { Socket as RawSocket } from 'net'

const defaultOptions = {
    protocol: "chat"
}

export default class SocketClient {
    raw = new RawSocket()
    #events = new Map()
    #isConnecting = false
    connected = false

    /**
     * @param {String} url 
     * @param {Object} options
     * @param {http.IncomingHttpHeaders} options.headers 
     * @param {"chat" | "superchat"} options.protocol
     */
    constructor(url, options = defaultOptions) {
        this.url = url
        this.options = options
    }

    /**
     * @param {string} url 
     * @returns {Promise<this>}
     */
    connect() {
        if (this.#isConnecting || this.connected) return new Promise((resolve) => resolve(this));
        this.#isConnectiong = true

        const headers = {
            ...this.options?.headers,
            Connection: 'Upgrade',
            upgrade: 'websocket',
            'Sec-Websocket-Version': 13,
            'Sec-Websocket-Protocol': this.options.protocol // Can be any protocol of your preference
        }

        const req = http.request(this.url, { headers })
        req.end()

        return new Promise((resolve, reject) => {
            req.on("error", (error) => {
                this.#isConnecting = false

                if (error.code === "ECONNREFUSED") {
                    console.error("The websocket server reject you!")
                    return
                }

                reject(error)
            })

            req.once("upgrade", (res, socket) => {
                this.#isConnecting = false
                this.raw = socket
                this.connected = true
                this.#attachEvents()
                resolve(this)
            })
        })
    }

    #attachEvents() {
        this.raw.on("data", (data) => {
            data
                .toString()
                .split("\n")
                .filter(line => !!line)
                .map(JSON.parse)
                .map(({ event, message }) => {
                    const eventFn = this.#events.get(event) || function () { }
                    eventFn(...message)
                })
        })

        this.raw.on("error", (err) => {
            if (err.code === 'ECONNRESET') {
                this.connected = false
                this.raw.destroy()
                setTimeout(this.connect, 3000)
            }

            console.error(err)
        })

        this.raw.on("end", () => {
            this.connected = false
        })
    }

    /**
     * Handle a event
     * @param {string} event 
     * @param {(...args) => void} fn
     */
    on(event, fn) {
        this.#events.set(event, fn)
        return this
    }

    /**
     * Handle a event once time
     * @param {string} event 
     * @param {(...args) => void} fn
     */
    once(event, fn) {
        this.#events.set(event, (...args) => {
            fn(...args)
            this.#events.delete(event)
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

        this.raw.write(`${JSON.stringify({ event, message: args })}\n`)
        return this
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        this.raw.end()
        this.raw.destroy()
        return this
    }
}
