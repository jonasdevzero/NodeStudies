import http from "http"
import crypto from "crypto"
import Websockets from "./websockets.js"
import { kOnNewConnection } from "./config.js"

export default class WebsocketServer extends Websockets {
    /**
     * Initialize a websocket server with a http server
     * @param {http.Server} server 
     */
    constructor(server) {
        super()
        this.#initialize(server)
    }

    #initialize(server) {
        server.on("upgrade", (req, socket) => {
            const headers = this.#authHandshake(req, socket)
            if (!headers.length) return;

            socket.write(headers) // handshake
            this[kOnNewConnection](socket) // class 'Websockets' function
        })
    }

    #authHandshake(req, socket) {
        const protocol = req.headers['sec-websocket-protocol']?.split(', ')[0]
        const version = req.headers['sec-websocket-version']
        const key = req.headers['sec-websocket-key']

        // Only accept: version >= 13 && 'api' or 'superchat' protocol - Can be any protocol of your preference
        if (version < 13 || protocol !== "chat") {
            socket.end() // rejecting socket
            socket.destroy()
            return ''
        }

        const accept = crypto
            .createHash("sha1")
            .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
            .digest("base64")

        const headers = [
            'HTTP/1.1 101 Web Socket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            'Sec-Websocket-Protocol: ' + protocol,
            'Sec-Websocket-Accept: ' + accept,
            ''
        ].map(line => line.concat("\r\n")).join("")

        return headers
    }
}