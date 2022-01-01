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
                request.params = params
                request.body = body ? JSON.parse(body) : {}
                request.query = query

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

                newPath += "\([.@!#$%^&*()a-zA-Z0-9]+)"
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
