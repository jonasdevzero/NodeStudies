import Router from "./router.js";
import UserController from "./controllers/UserController.js";

const router = new Router()

const userController = new UserController()

router.get("/", (req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.write(`Ok`)
    res.end()
})

router.get("/user", userController.index)

router.get("/user/:id", userController.get)

router.post("/user", userController.create)

router.put("/user/:id", userController.update)

router.delete("/user/:id", userController.delete)

export default router
