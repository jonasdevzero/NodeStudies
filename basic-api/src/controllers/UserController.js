import { IncomingMessage, ServerResponse } from "http"
import fs from "fs/promises"
import UserRepository from "../repositories/userRepository.js"
import User from "../models/user.js"

const DEFAULT_HEADER = { "Content-Type": "text/json" }

/**
 * @param {{ userRepository: UserRepository }} param0 
 */
export default function UserController({ userRepository }) {

    return {
        /**
        * @param {IncomingMessage} req
        * @param {ServerResponse} res
        */
        async index(req, res) {
            try {
                const users = await userRepository.find()

                res.writeHead(200, DEFAULT_HEADER)
                res.write(JSON.stringify({ users }))
                res.end()
            } catch (error) {
                res.writeHead(500, DEFAULT_HEADER)
                res.write(`Error: ${error}`)
                res.end()
            }
        },

        /**
        * @param {IncomingMessage} req
        * @param {ServerResponse} res
        */
        async get(req, res) {
            try {
                const id = req.params.id

                const user = await userRepository.findOne(Number(id))

                res.writeHead(200, DEFAULT_HEADER)
                res.write(JSON.stringify({ user }))
                res.end()
            } catch (error) {
                res.writeHead(500, DEFAULT_HEADER)
                res.write(`Error: ${error}`)
                res.end()
            }
        },

        /**
        * @param {IncomingMessage} req
        * @param {ServerResponse} res
        */
        async create(req, res) {
            try {
                const data = req.body

                const user = new User(data)

                const { valid, error } = user.isValid()
                if (!valid) {
                    res.writeHead(400, DEFAULT_HEADER)
                    res.write(JSON.stringify({ error: error.join(", ") }))
                    return res.end()
                }

                await userRepository.create(user)

                res.writeHead(201, DEFAULT_HEADER)
                res.write(JSON.stringify({ message: `user '${data.name} ${data.last_name}' created` }))
                res.end()
            } catch (error) {
                res.writeHead(500, DEFAULT_HEADER)
                res.write(`Error: ${error}`)
                res.end()
            }
        },

        /**
        * @param {IncomingMessage} req
        * @param {ServerResponse} res
        */
        async update(req, res) {
            try {
                const id = Number(req.params.id)
                const { name, last_name } = req.body

                if (!name && !last_name) {
                    res.writeHead(400, DEFAULT_HEADER)
                    res.write(JSON.stringify({ error: "'name' or 'last_name' is missing" }))
                    return res.end()
                }

                await userRepository.update(id, { name, last_name })

                res.writeHead(200, DEFAULT_HEADER)
                res.write(JSON.stringify({ message: "Ok" }))
                res.end()
            } catch (error) {
                res.writeHead(500, DEFAULT_HEADER)
                res.write(`Error: ${error}`)
                res.end()
            }
        },

        /**
        * @param {IncomingMessage} req
        * @param {ServerResponse} res
        */
        async remove(req, res) {
            try {
                const id = Number(req.params.id)

                await userRepository.delete(id)

                res.writeHead(200, DEFAULT_HEADER)
                res.write(JSON.stringify({ message: "Ok" }))
                res.end()
            } catch (error) {
                res.writeHead(500, DEFAULT_HEADER)
                res.write(`Error: ${error}`)
                res.end()
            }
        },
    }
}
