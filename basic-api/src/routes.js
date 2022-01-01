import Router from "./router.js";
import UserFactory from "./factories/userFactory.js"

const router = new Router()

const userController = UserFactory.generateInstance()

router.get("/", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Ok`)
    res.end()
})

router.get("/user", userController.index)

router.get("/user/:id", userController.get)

router.post("/user", userController.create)

router.put("/user/:id", userController.update)

router.delete("/user/:id", userController.remove)

export default router
