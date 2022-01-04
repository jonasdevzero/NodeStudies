import { Socket as RawSocket } from 'net'
import Event from 'events'
import Socket from './socket.js'
import { kRooms, kOnNewConnection, kSocketEvents, kSocketRooms } from "./config.js"
import { parseFrame, constructReply } from "./util.js"

export default class Sockets extends Event {
    #currentTo = []
    #users = new Map()

    constructor() {
        super()
        this[kRooms] = new Map()
    }

    /**
     * @param {RawSocket} rawSocket
     */
    async [kOnNewConnection](rawSocket) {
        const socket = new Socket(rawSocket, this)
        this.#users.set(socket.id, socket)

        rawSocket.on('data', this.#onSocketData(socket))
        rawSocket.on('error', this.#onSocketError(socket))
        rawSocket.on('end', this.#onSocketEnd(socket))

        super.emit("connection", socket)
    }

    /**
     * @param {Socket} socket 
     * @returns {(data: Buffer) => void} 
     */
    #onSocketData(socket) {
        return (frame) => {
            try {
                const data = parseFrame(frame)
                if (!data) return;

                let { event, message } = JSON.parse(data)

                // This allows callback functions between the client and server
                message = message.map((m, i) => m == `${event}::callback:${i}` ? (...args) => { socket.emit(m, ...args) } : m)
                this.#execEvent(socket, event, message)
            } catch (error) {
                console.error('Wrong event format!!', parseFrame(data), "\n", error)
            }
        }
    }

    /**
     * @param {Socket} socket 
     * @returns {(err: Error) => void} 
     */
    #onSocketError(socket) {
        return (err) => {
            if (err.code === 'ECONNRESET') {
                this.#onSocketEnd(socket)()
            }

            // ...
        }
    }

    /**
     * @param {Socket} socket 
     * @returns {() => void} 
     */
    #onSocketEnd(socket) {
        return () => {
            this.#users.delete(socket.id)
            this.#execEvent(socket, 'disconnect')
            this.#socketExitRooms(socket)
            socket.rawSocket.end()
        }
    }

    /**
     * Get and execute a event based in the socket client and even name
     * @param {Socket} socket 
     * @param {string} event - The event name
     * @param {any[]} message - The arguments of the event
     */
    #execEvent(socket, event, message = []) {
        const eventFunction = socket[kSocketEvents].get(event) || function () { }
        eventFunction(...message)
    }

    /**
     * @param {Socket} socket 
     */
    #socketExitRooms(socket) {
        const rooms = socket[kSocketRooms]
        for (const room of rooms) {
            const usersOnRoom = this[kRooms].get(room)
            usersOnRoom ? usersOnRoom.delete(socket.id) : null
            this[kRooms].set(room, usersOnRoom)
        }
    }

    /**
     * broadcast an event to all sockets in a room
     * @param {String} target room id
     * @param {Buffer} data WebSocket frame
     */
    #broadCast(target, data) {
        const room = this[kRooms].get(target)

        for (const [_, user] of room) {
            user.rawSocket.write(constructReply(data))
        }
    }

    /**
     * Handle a server event based in the protocol
     * @param {'connection'} event 
     * @param {(socket: Socket) => void} fn 
     */
    on(event, fn) {
        super.on(event, fn)
    }

    /**
     * Save the `target` to the next `emit()` function
     * @param {String | String[]} target 
     */
    to(target) {
        Array.isArray(target) ? this.#currentTo = [...this.#currentTo, ...target] : this.#currentTo.push(target)
        return this
    }

    /**  
     * Throws a websocket event for the last `target` saved in the `to()` function
     * @param {String} event
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

        const data = constructReply({ event, message: args })

        for (const target of this.#currentTo) {
            const user = this.#users.get(target)
            user ? user.rawSocket.write(data) : this.#broadCast(target, data)
        }

        this.#currentTo = []
        return this
    }
}