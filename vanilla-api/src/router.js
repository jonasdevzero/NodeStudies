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
    * @param {http.IncomingMessage} request
    * @param {http.ServerResponse} response
    */
    lookup(request, response) {
        const { method } = request

        let { pathname, query } = url.parse(request.url)

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

            let body = ""
            request.on("data", chunk => {
                body += chunk
            })

            request.on("end", () => {
                const serverRequest = new ServerRequest({
                    request,
                    params,
                    query,
                    body: body ? JSON.parse(body) : {}
                })
                const serverResponse = new ServerResponse(response)

                route.handle(serverRequest, serverResponse)
            })
        } else {
            response.writeHead(404, { "Content-Type": "text/plain" })
            response.write(`Route Not Found!`)
            response.end()
        }
    }

    /**
     * 
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method 
     * @param {string} path 
     * @param {(request: ServerRequest, response: ServerResponse) => void} handle 
     */
    on(method, path, handle) {
        let newPath = ""
        let isRegex = false
        const paramsName = []
        
        for (let i = 0, len = path.length; i < len; i++) {
            const charCode = path[i].charCodeAt()

            if (charCode === 58) { // charCode === 58 --> ':'
                let parametricEnd = i
                
                for (let j = i; j < len; j++) {
                    if (path[j].charCodeAt() === 47) { // charCode === 47 --> '/'
                        parametricEnd = j;
                        break
                    }
                }
                
                isRegex = true
                paramsName.push(path.slice(i + 1, parametricEnd > i ? parametricEnd : len))
                newPath += "\([.@!#$%^&*()a-zA-Z0-9]+)"
                i = parametricEnd > i ? parametricEnd - 1 : len
            } else if (charCode === 42) { // charCode === 42 --> '*'
                isRegex = true
                paramsName.push("*")                
                const conditional = newPath.length > 1 && newPath[newPath.length - 1].charCodeAt() === 47 ? newPath.slice(0, newPath.length - 1) : newPath
                newPath += "\([.@!#$%^&*()a-zA-Z0-9\/]+)|" + conditional
                i = len
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
     * @param {(request: ServerRequest, response: ServerResponse) => void} handle
     */
    get(path, handle) {
        this.on("GET", path, handle)
    }

    /**
     * @param {string} path
     * @param {(request: ServerRequest, response: ServerResponse) => void} handle
     */
    post(path, handle) {
        this.on("POST", path, handle)
    }

    /**
     * @param {string} path
     * @param {(request: ServerRequest, response: ServerResponse) => void} handle
     */
    put(path, handle) {
        this.on("PUT", path, handle)
    }

    /**
     * @param {string} path
     * @param {(request: ServerRequest, response: ServerResponse) => void} handle
     */
    delete(path, handle) {
        this.on("DELETE", path, handle)
    }
}

export class ServerRequest {
    /**
     * @param {{ request: http.IncomingMessage }} 
     */
    constructor({ request, params, query, body }) {
        this.raw = request
        this.params = params
        this.query = query
        this.body = body
    }
}

export class ServerResponse {
    DEFAULT_HEADER = { "Content-Type": "text/json" }

    /**
     * @param {http.ServerResponse} req 
     */
    constructor(req) {
        this.raw = req
    }

    /**
     * Sets the status response
     * @param {number} status 
     */
    status(status) {
        this.raw.statusCode = status
        return this
    }

    /**
     * Response JSON object
     * @param {any} data 
     */
    send(data) {
        this.raw.writeHead(this.raw.statusCode, this.DEFAULT_HEADER)
        this.raw.write(JSON.stringify(data))
        this.raw.end()
    }

    /**
     * Response text
     * @param {string} txt
     */
    text(txt) {
        this.raw.writeHead(this.raw.statusCode, { "Content-Type": "text/plain" })
        this.raw.write(txt)
        this.raw.end()
    }
}
