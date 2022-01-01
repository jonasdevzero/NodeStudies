import UserRepository from "../repositories/userRepository.js";
import UserController from "../controllers/userController.js";

function generateInstance() {
    const userRepository = new UserRepository({ file: "./data.json" })
    const userController = UserController({ userRepository })

    return userController
}

export default {
    generateInstance
}