import { IncomingMessage, ServerResponse } from "http"
import fs from "fs/promises"

export default class UserController {
    constructor() { }

    /**
    * @param {IncomingMessage} req
    * @param {ServerResponse} res
    */
    async index(req, res) {
        try {
            const data = await fs.readFile("./data.json")
            const users = JSON.parse(data).users

            res.writeHead(200, { "Content-Type": "text/plain" })
            res.write(JSON.stringify({ users }))
            res.end()
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/json" })
            res.write(`Error: ${error}`)
            res.end()
        }
    }

    /**
    * @param {IncomingMessage} req
    * @param {ServerResponse} res
    */
    async get(req, res) {
        try {
            const id = req.params.id

            const data = await fs.readFile("./data.json")
            const users = JSON.parse(data).users

            const user = users.find(u => u.id === Number(id))           

            res.writeHead(200, { "Content-Type": "text/json" })
            res.write(JSON.stringify({ user }))
            res.end()
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain" })
            res.write(`Error: ${error}`)
            res.end()
        }
    }

    /**
    * @param {IncomingMessage} req
    * @param {ServerResponse} res
    */
    async create(req, res) {
        try {
            const data = req.body

            const id = (Math.random() * 100) + Date.now()
            data.id = id

            const jsonData = await fs.readFile("./data.json")
            const d = JSON.parse(jsonData)
            d.users.push(data)            

            await fs.writeFile("./data.json", JSON.stringify(d))

            res.writeHead(201, { "Content-Type": "text/plain" })
            res.write(`user ${data.name} created`)
            res.end()
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain" })
            res.write(`Error: ${error}`)
            res.end()
        }
    }

    /**
    * @param {IncomingMessage} req
    * @param {ServerResponse} res
    */
    async update(req, res) {
        try {
            const id = Number(req.params.id)
            const data = req.body

            const jsonData = await fs.readFile("./data.json")
            const d = JSON.parse(jsonData)
            d.users = d.users.map(u => u.id === id ? { id: u.id, ...data } : u)

            await fs.writeFile("./data.json", JSON.stringify(d))

            res.writeHead(200, { "Content-Type": "text/plain" })
            res.write(`update 'user'`)
            res.end()
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain" })
            res.write(`Error: ${error}`)
            res.end()
        }
    }

    /**
    * @param {IncomingMessage} req
    * @param {ServerResponse} res
    */
    async delete(req, res) {
        try {
            const id = Number(req.params.id)

            const jsonData = await fs.readFile("./data.json")
            const d = JSON.parse(jsonData)
            d.users = d.users.filter(u => u.id !== id)
            
            await fs.writeFile("./data.json", JSON.stringify(d))

            res.writeHead(200, { "Content-Type": "text/plain" })
            res.write(`delete 'user'`)
            res.end()
        } catch (error) {
            res.writeHead(500, { "Content-Type": "text/plain" })
            res.write(`Error: ${error}`)
            res.end()
        }
    }
}
