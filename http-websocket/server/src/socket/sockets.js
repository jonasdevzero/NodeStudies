import { Socket as RawSocket } from 'net'
import Socket from './socket.js'
import Event from 'events'

const kRooms = Symbol.for('kRooms'),
    kOnNewConnection = Symbol.for('kOnNewConnection'),
    kSocketEvents = Symbol.for('kEvents')
export default class Sockets extends Event {
    #currentTo = []
    #users = new Map()

    constructor() {
        super()
        this[kRooms] = new Map()
    }

    /**
     * @param {RawSocket} rawSocket
     * @param {'chat' | 'superchat'} protocol
     */
    async [kOnNewConnection](rawSocket, protocol) {
        const socket = new Socket(rawSocket, this)
        this.#users.set(socket.id, socket)

        rawSocket.on('data', this.#onSocketData(socket))
        rawSocket.on('error', this.#onSocketError(socket))
        rawSocket.on('end', this.#onSocketEnd(socket))

        const event = protocol === 'chat' ? 'connection' : 'superconnection'
        super.emit(event, socket)
    }

    /**
     * @param {Socket} socket 
     * @returns {(data: Buffer) => void} 
     */
    #onSocketData(socket) {
        return (data) => {
            try {
                data
                    .toString()
                    .split('\n')
                    .filter(line => !!line)
                    .map(JSON.parse)
                    .map(({ event, message }) => {
                        // This allows callback functions between the client and server
                        message = message.map((m, i) => m == `${event}::callback:${i}` ? (...args) => { socket.emit(m, ...args) } : m)
                        this.#execEvent(socket, event, message)
                    })
            } catch (error) {
                console.error('Wrong event format!!', data.toString(), error)
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

    #execEvent(socket, event, message = []) {
        const eventFunction = socket[kSocketEvents].get(event) || function () { }
        eventFunction(...message)
    }

    /**
     * 
     * @param {Socket} socket 
     */
    #socketExitRooms(socket) {
        const rooms = socket[Symbol.for('kSocketRooms')]
        for (const room of rooms) {
            const usersOnRoom = this[kRooms].get(room)
            usersOnRoom ? usersOnRoom.delete(socket.id) : null
            this[kRooms].set(room, usersOnRoom)
        }
    }

    /**
     * broadcast an event to all sockets in a room
     * @param {String} target room id
     * @param {String} data JSON string
     */
    #broadCast(target, data) {
        const room = this[kRooms].get(target)

        for (const [_, user] of room) {
            user.rawSocket.write(`${data}\n`)
        }
    }

    /**
     * Handle a server event based in the protocol
     * @param {'connection' | 'superconnection'} event 
     * @param {(...args) => void} fn 
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
        const data = JSON.stringify({ event, message: args })

        for (const target of this.#currentTo) {
            const user = this.#users.get(target)
            user ? user.rawSocket.write(`${data}\n`) : this.#broadCast(target, data)
        }

        this.#currentTo = []
        return this
    }
}