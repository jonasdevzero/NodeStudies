import Socket from "./socket.js"

const roomName = prompt("Write the room name:")

const messages = document.querySelector(".messages")
const form = document.getElementById("form")
const input = document.getElementById("text")
let userId = undefined

const socket = new Socket("ws://localhost:9000", "chat")

socket.connect().then(() => {
    socket.emit("connected", roomName, (socketId) => {
        userId = socketId
    })
})

socket.on("message", message => {
    const msgEl = document.createElement("span")

    msgEl.innerHTML = message.text
    msgEl.className = message.sender === userId ? "sender" : ""

    messages.appendChild(msgEl)
})

form.addEventListener("submit", e => {
    e.preventDefault()
    
    const message = { text: input.value, sender: userId }
    
    socket.isConnected && !!message.text.trim() ?
        socket.emit("message", { roomName, message }, () => input.value = "") : null
})
