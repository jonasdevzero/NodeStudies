import AbstractView from "./AbstractView.js";

export default class Dashboard extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Dashboard")
    }

    async getHtml() {
        return /*html*/`
            <h1>Welcome back</h1>
            
            <p>                
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Vivamus ullamcorper rhoncus augue facilisis blandit. Phasellus et odio vitae ipsum molestie ornare quis sed nisi. 
                Donec massa purus, egestas in odio sit amet, ullamcorper varius neque.
            </p>

            <br />

            <p>
                <a href="posts" data-link>View recent posts</a>
            </p>

            <br />
            <hr />
        `
    }
}