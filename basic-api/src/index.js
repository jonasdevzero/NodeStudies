import http from "http"

const port  = process.env.PORT || 5000

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write("Hello World")
    res.end()
})

server.listen(port, () => console.log(`Server running at http://localhost:${port}`))
