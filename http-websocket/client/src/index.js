import SocketClient from "./socket.js"

const url = 'http://localhost:9000'

const socket = new SocketClient(url, { protocol: "chat" })
await socket.connect()

socket.emit("message", "ping", (msg) => {
    console.log('mesage callback:', msg)
})
