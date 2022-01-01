import Router from "./router.js"
import UserFactory from "./factories/userFactory.js"

const router = new Router()

const userController = UserFactory.generateInstance()

router.get("/", (_req, res) => res.status(200).text("Ok"))

// Wildcard test route
router.get("/wildcard/*", (req, res) => {
    const path = req.params["*"]
    res.status(200).send({ message: `Selected path /wildcard/${path}` })
})

// User routes
router.get("/user", userController.index)
router.get("/user/:id", userController.get)
router.post("/user", userController.create)
router.put("/user/:id", userController.update)
router.delete("/user/:id", userController.remove)


export default router
