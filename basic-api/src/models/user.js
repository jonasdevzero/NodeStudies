
export default class User {
    constructor({ name, last_name }) {
        this.id = (Math.random() * 100) + Date.now()
        this.name = name
        this.last_name = last_name
    }

    isValid() {
        const propertyNames = Object.getOwnPropertyNames(this)
        const amountInvlid = propertyNames
            .map(p => !!this[p] ? null : `${p} is missing`)
            .filter(i => !!i)

        return {
            valid: amountInvlid.length === 0,
            error: amountInvlid
        }
    }
}