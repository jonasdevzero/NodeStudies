import http from "http"
import router from "./test/routes-test.js"
import routes from "./routes.js"

const port = process.env.PORT || 5000

const server = http.createServer((req, res) => {

    // router(req, res)
    routes.lookup(req, res)
})

server.listen(port, () => console.log(`Server running at http://localhost:${port}`))
