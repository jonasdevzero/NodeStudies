import http from "http"
import url from "url"

export default class Router {
    routes = {
        "GET": [],
        "POST": [],
        "PUT": [],
        "DELETE": [],
    }

    constructor() { }

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    lookup(req, res) {
        const { method } = req

        let { pathname, query } = url.parse(req.url)

        // removing the "/" in the last index
        if (pathname.length > 1 && pathname.split("")[pathname.length - 1].charCodeAt() === 47)
            pathname = pathname.slice(0, pathname.length - 1);

        const route = this.routes[method]?.find(r => r.isRegex ? r.path.exec(pathname)?.[0] === pathname : false || r.path === pathname)

        if (route) {
            const params = {}

            if (route.isRegex) {
                const paramValues = route.path.exec(pathname).filter((_, i) => i !== 0)
                route.paramsName.map((n, i) => params[n] = paramValues[i])
            }
                
            let data = ""
            req.on("data", chunk => {
                data += chunk
            })

            req.on("end", () => {
                req.params = params
                req.data = data ? JSON.parse(data) : undefined
                route.handle(req, res)
            })
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" })
            res.write(`Route Not Found!`)
            res.end()
        }
    }

    /**
     * 
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method 
     * @param {string} path 
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => void} handle 
     */
    on(method, path, handle) {

        let newPath = ""
        let isRegex = false
        const paramsName = []
        for (let i = 0, len = path.length; i < len; i++) {
            if (path[i].charCodeAt() === 58) {
                isRegex = true
                let wildcardEnd = i

                for (let j = i; j < len; j++) {
                    if (path[j].charCodeAt() === 47) {
                        wildcardEnd = j;
                        break
                    }
                }

                paramsName.push(path.slice(i + 1, wildcardEnd > i ? wildcardEnd : len))

                newPath += "\([a-zA-Z0-9\-o]+)"
                i = wildcardEnd > i ? wildcardEnd - 1 : len
            } else {
                newPath += path[i]
            }
        }

        this.routes[method].push({
            path: isRegex ? new RegExp(newPath) : path,
            isRegex,
            handle,
            paramsName,
        })
    }

    /**
     * @param {string} path
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => void} handle
     */
    get(path, handle) {
        this.on("GET", path, handle)
    }

    /**
     * @param {string} path
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => void} handle
     */
    post(path, handle) {
        this.on("POST", path, handle)
    }

    /**
     * @param {string} path
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => void} handle
     */
    put(path, handle) {
        this.on("PUT", path, handle)
    }

    /**
     * @param {string} path
     * @param {(req: http.IncomingMessage, res: http.ServerResponse) => void} handle
     */
    delete(path, handle) {
        this.on("DELETE", path, handle)
    }
}