import Socket from "./socket.js"

const socket = new Socket("ws://localhost:9000", "chat")

console.log("socket connecting")
socket.connect().then(() => {
    console.log("socket connected")

    socket.on("message", (message, callback) => {
        console.log("message from server:", message)

        callback("Hello Server - 2")
    })

    socket.emit("message", "Hello Server - 1", (serverMessage) => {
        console.log("message from server:", serverMessage)
    })
})