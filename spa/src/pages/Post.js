import AbstractView from "./AbstractView.js";

export default class Post extends AbstractView {
    constructor(params) {        
        super(params)
        this.setTitle("Viewing Post")
    }

    async getHtml() {
        return /*html*/`
            <h1>Post: ${this.params.id}</h1>
            
            <p>                
                You are viewing the posts!
            </p>
        `
    }
}