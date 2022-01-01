import { ServerRequest, ServerResponse } from "../router.js"
import UserRepository from "../repositories/userRepository.js"
import User from "../models/user.js"

/**
 * @param {{ userRepository: UserRepository }} param0 
 */
export default function UserController({ userRepository }) {

    return {
        /**
        * @param {ServerRequest} request
        * @param {ServerResponse} response
        */
        async index(_request, response) {
            try {
                const users = await userRepository.find()

                response.status(200).send({ users })
            } catch (error) {
                response.status(500).send({ error })
            }
        },

        /**
        * @param {ServerRequest} request
        * @param {ServerResponse} response
        */
        async get(request, response) {
            try {
                const id = Number(request.params.id)

                const user = await userRepository.findOne(id)

                response.status(200).send({ user })
            } catch (error) {
                response.status(500).send({ error })
            }
        },

        /**
        * @param {ServerRequest} request
        * @param {ServerResponse} response
        */
        async create(request, response) {
            try {
                const data = request.body

                const user = new User(data)
                const { valid, error } = user.isValid()

                if (!valid) 
                    return response.status(400).send({ error: error.join(", ") })                

                await userRepository.create(user)

                response.status(201).send({ message: `user '${data.name} ${data.last_name}' created` })
            } catch (error) {
                response.status(500).send({ error })
            }
        },

        /**
        * @param {ServerRequest} request
        * @param {ServerResponse} response
        */
        async update(request, response) {
            try {
                const id = Number(request.params.id)
                const { name, last_name } = request.body

                if (!name && !last_name) 
                    return response.status(400).send({ error: "'name' or 'last_name' is missing" })
                
                await userRepository.update(id, { name, last_name })

                response.status(200).send({ message: "Ok" })
            } catch (error) {
                response.status(500).send({ error })
            }
        },

        /**
        * @param {ServerRequest} request
        * @param {ServerResponse} response
        */
        async remove(request, response) {
            try {
                const id = Number(request.params.id)

                await userRepository.delete(id)

                response.status(200).send({ message: "Ok" })
            } catch (error) {
                response.status(500).send({ error })
            }
        },
    }
}
