import AbstractView from "./AbstractView.js";

export default class Posts extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Posts")
    }

    async getHtml() {
        return /*html*/`
            <h1>Posts</h1>
            
            <p>                
                You are viewing the posts!
            </p>
        `
    }
}