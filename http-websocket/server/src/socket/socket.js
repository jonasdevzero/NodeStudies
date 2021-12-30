import { Socket as RawSocket } from 'net'
import Sockets from './sockets.js'
import { v4 as uuidV4 } from 'uuid'

const kEvents = Symbol.for('kEvents'),
    kSocketRooms = Symbol.for('kSocketRooms'),
    kRooms = Symbol.for('kRooms')
export default class Socket {
    #sockets

    /**
     * @param {RawSocket} rawSocket
     * @param {Sockets} sockets
     */
    constructor(rawSocket, sockets) {
        this.rawSocket = rawSocket
        this.id = uuidV4()
        this.#sockets = sockets
        this[kEvents] = new Map()
        this[kSocketRooms] = []
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
     * Emit a event to this socket
     * @param {string} event
     */
    emit(event, ...args) {
        const data = JSON.stringify({ event, message: args })
        this.rawSocket.write(`${data}\n`)
        return this
    }

    /**
     * Join in a room
     * @param {String} room 
     */
    join(room) {
        const usersOnRoom = this.#sockets[kRooms].get(room) ?? new Map()
        usersOnRoom.set(this.id, this)
        this.#sockets[kRooms].set(room, usersOnRoom)

        this[kSocketRooms].filter(r => r !== room).push(room)

        return this
    }

    /**
     * Leave from a room
     * @param {String} room 
     */
    leave(room) {
        const usersOnRoom = this.#sockets[kRooms].get(room)
        usersOnRoom ? usersOnRoom.delete(this.id) : null
        this.#sockets[kRooms].set(room, usersOnRoom)

        this[kSocketRooms].filter(r => r !== room)

        return this
    }
}
