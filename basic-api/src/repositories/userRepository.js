import fs from "fs/promises"
import User from "../models/user.js"

export default class UserRepository {
    constructor({ file }) {
        this.file = file
    }

    async _currentFileContent() {
        return JSON.parse(await fs.readFile(this.file))
    }

    async _updateFileContent(data) {
        await fs.writeFile(this.file, JSON.stringify(data))
    }

    async find() {
        const data = await this._currentFileContent()
        return data.users
    }

    async findOne(id) {
        const data = await this._currentFileContent()
        return data.users.find(u => u.id == id)
    }

    /**
     * @param {User} user 
     */
    async create(user) {
        const data = await this._currentFileContent()
        data.users.push(user)

        await this._updateFileContent(data)
    }

    /**
     * @param {number} id 
     * @param {{ name: string, last_name: string }} data 
     */
    async update(id, { name, last_name }) {
        const data = await this._currentFileContent()
        data.users = data.users.map(u => u.id === id ? { id: u.id, name, last_name } : u)

        await this._updateFileContent(data)
    }

    async delete(id) {
        const data = await this._currentFileContent()
        data.users = data.users.filter(u => u.id !== id)

        await this._updateFileContent(data)
    }
}