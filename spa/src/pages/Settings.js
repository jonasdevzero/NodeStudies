import AbstractView from "./AbstractView.js";

export default class Settings extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Settings")
    }

    async getHtml() {
        return /*html*/`
            <h1>Settings</h1>
            
            <p>                
                Manage your privacy and configurations.
            </p>
        `
    }
}