import Router from "./router.js";

const router = new Router()

router.get("/", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Route: /`)
    res.end()
})

router.get("/user", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Route: /user`)
    res.end()
})

router.get("/user/:id", (req, res) => {
    // console.log("params", req.params)

    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Especial Route: /user/${req.url.split("/")[2]}`)
    res.end()
})

router.get("/user/:id/message/:message_id", (req, res) => {
    console.log("params", req.params)

    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Especial Route: /user/${req.url.split("/")[2]}/message/${req.url.split("/")[4]}`)
    res.end()
})

router.post("/user", (req, res) => {   
    console.log("data", req.data)

    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write("Route to Create User")
    res.end()
})

export default router
