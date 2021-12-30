import WebsocketServer from "./socket/index.js"
import Socket from "./socket/socket.js"

const port = process.env.PORT || 9000

const ws = new WebsocketServer({ port })

ws.on('connection', onConnection)

/**
 * @param {Socket} socket 
 */
function onConnection(socket) {
    console.log('New connection at', socket.id)

    socket.on('message', (message, callback) => {
        console.log('message:', message)
        
        callback('pong')
    })
}

ws.initialize()
console.log("Zero WebSocket server is running at", port)
