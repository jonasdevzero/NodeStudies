import http from 'http'
import Sockets from './sockets.js'

export default class WebsocketServer extends Sockets {
    constructor({ port }) {
        super()
        this.port = port
    }

    /**
     * @returns {Promise<http.Server>}
     */
    async initialize() {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { "Content-Type": "text/plain" })
            res.end("Servidor Zero")
        })

        server.on("upgrade", (req, socket) => {
            const [headers, protocol] = this.#authHandshake(req, socket)
            if (!headers.length) return;

            socket.write(headers) // handshake
            this[Symbol.for('kOnNewConnection')](socket, protocol) // class 'Sockets' function
        })

        return new Promise((resolve, reject) => {
            server.on("error", reject)
            server.listen(this.port, () => resolve(server))
        })
    }

    #authHandshake(req, socket) {
        const protocol = req.headers['sec-websocket-protocol']?.split(', ')[0]
        const version = req.headers['sec-websocket-version']

        // Only accept: version >= 13 && 'api' or 'superchat' protocol - Can be any protocol of your preference
        if (version < 13 || !['chat', 'superchat'].includes(protocol)) {
            socket.end() // rejecting socket
            socket.destroy()
            return ['']
        }

        const headers = [
            'HTTP/1.1 101 Web Socket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            'Sec-Websocket-Protocol: ' + protocol,
            ''
        ].map(line => line.concat("\r\n")).join("")

        return [headers, protocol]
    }
}