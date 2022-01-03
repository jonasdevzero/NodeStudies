import http from "http"
import WebsocketServer from "./socket/server.js";

const port = process.env.PORT || 9000

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write("Websocket Server")
    res.end()
})

const ws = new WebsocketServer(server)

ws.on("connection", (socket) => {
    socket.on("message", (message, callback) => {
        console.log("message from client:", message)

        callback("Hello client - 2")
    })

    socket.emit("message", "Hello Client - 1", (clientMessage) => {
        console.log("message from client", clientMessage)
    })
})

server.listen(port, () => console.log("Server running at", port))