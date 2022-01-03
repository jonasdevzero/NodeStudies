import { Socket as RawSocket } from 'net'
import { v4 as uuidV4 } from 'uuid'
import WebsocketServer from './server.js'
import { kSocketEvents, kSocketRooms, kRooms } from "./config.js"
import { sendTextFrame } from "./util.js"

export default class Socket {
    #server

    /**
     * @param {RawSocket} rawSocket
     * @param {WebsocketServer} server
     */
    constructor(rawSocket, server) {
        this.rawSocket = rawSocket
        this.id = uuidV4()
        this.#server = server
        this[kSocketEvents] = new Map()
        this[kSocketRooms] = []
    }

    /**
     * Handle a event
     * @param {string} event 
     * @param {(...args) => void} fn 
     */
    on(event, fn) {
        this[kSocketEvents].set(event, fn)
        return this
    }

    /**
     * Handle a event once time
     * @param {string} event 
     * @param {(...args) => void} fn 
     */
    once(event, fn) {
        this[kSocketEvents].set(event, (...args) => {
            fn(...args)
            this[kSocketEvents].delete(event)
        })

        return this
    }

    /**
     * Emit a event to this socket
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

        const data = JSON.stringify({ event, message: args })
        this.rawSocket.write(sendTextFrame(data))
        return this
    }

    /**
     * Join in a room
     * @param {String} room 
     */
    join(room) {
        const usersOnRoom = this.#server[kRooms].get(room) ?? new Map()
        usersOnRoom.set(this.id, this)
        this.#server[kRooms].set(room, usersOnRoom)

        this[kSocketRooms].filter(r => r !== room).push(room)

        return this
    }

    /**
     * Leave from a room
     * @param {String} room 
     */
    leave(room) {
        const usersOnRoom = this.#server[kRooms].get(room)
        usersOnRoom ? usersOnRoom.delete(this.id) : null
        this.#server[kRooms].set(room, usersOnRoom)

        this[kSocketRooms].filter(r => r !== room)

        return this
    }
}
