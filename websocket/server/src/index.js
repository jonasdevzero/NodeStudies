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
    socket.on("connected", (roomName, callback) => {
        socket.join(roomName)
        
        callback(socket.id)
    })

    socket.on("message", ({ roomName, message }, callback) => {
        ws.to(roomName).emit("message", message)

        callback()
    })
})

server.listen(port, () => console.log("Server running at", port))