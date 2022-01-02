import Dashboard from "./pages/Dashboard.js"
import Posts from "./pages/Posts.js"
import Post from "./pages/Post.js"
import Settings from "./pages/Settings.js"

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$")

const getParams = match => {
    const values = match.result.slice(1)
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1])

    return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
}

const navigateTo = url => {
    history.pushState(null, null, url)
    router()
}

const router = async () => {
    const routes = [
        {
            path: "/",
            view: Dashboard
        },
        {
            path: "/posts",
            view: Posts
        },
        {
            path: "/posts/:id",
            view: Post
        },
        {
            path: "/settings",
            view: Settings
        },
    ]

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        }
    })

    let match = potentialMatches.find(p => p.result)

    if (!match) {
        match = {
            route: routes[0],
            result: true
        }
    }

    const view = new match.route.view(getParams(match))

    document.querySelector("#app").innerHTML = await view.getHtml()
}

window.addEventListener("popstate", router)

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            navigateTo(e.target.href)
        }
    })

    router()
})