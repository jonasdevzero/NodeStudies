import http from "http"
import url from "url"

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
export default function router(req, res) {
    const { method } = req

    let { pathname, query } = url.parse(req.url)

    // removing the "/" if it´s the last index
    if (pathname.length > 1 && pathname.split("")[pathname.length - 1].charCodeAt() === 47)
        pathname = pathname.slice(0, pathname.length - 1);

    const testRoute = "/user/:id/delete/:name"

    let s = ""
    const params = {}
    for (let i = 0, len = testRoute.length; i < len; i++) {
        if (testRoute[i].charCodeAt() === 58) {
            let end = i
            for (let k = i; k < len; k++) {
                if (testRoute[k].charCodeAt() === 47) {
                    end = k
                    break
                }
            }

            let paramValueEnd = i
            for (let l = i; l < pathname.length; l++) {
                if (pathname[l].charCodeAt() === 47) {
                    paramValueEnd = l
                    break
                }
            }


            const paramName = testRoute.slice(i + 1, end > i ? end : len)

            const paramValue = pathname.slice(i, paramValueEnd)

            console.log("paramValue", paramValue)
            
            params[paramName] = paramValue

            s += "\[a-zA-Z0-9\-o]+"
            i = end > i ? end - 1 : len
            
            

            // console.log("testRoute with regex", new RegExp(testRoute.substring(0, i - 1) + "\/[a-zA-Z0-9\-o]+" + testRoute.substring(end)))
            // console.log("testRoute with regex", new RegExp(testRoute.substring(0, i - 1) + "\/[a-zA-Z0-9\-o]+" + testRoute.substring(end)).test(pathname))

            // console.log("path with regex", r.concat("\/[a-zA-Z0-9\-o]+"))
            // console.log("regex", new RegExp(r.concat("\/[a-zA-Z0-9\-o]+")).exec(req.url)[0] === req.url)
            // console.log("path with regex with test", new RegExp(testRoute.slice(0, i - 1).concat("\/[a-zA-Z0-9\-o]+")).test(pathname))
        } else {
            s += testRoute[i]
        }
    }

    console.log("params", params)

    // console.log("pathname", pathname)
    // console.log("s", new RegExp(s))

    const routes = {
        "GET": [
            {
                path: "/", isRegex: false, handle(req, res) {
                    res.writeHead(200, { "Content-Type": "text/plain" })
                    res.write(`Route: /`)
                    res.end()
                }
            },
            {
                path: "/user", isRegex: false, handle(req, res) {
                    res.writeHead(200, { "Content-Type": "text/plain" })
                    res.write(`Route: /user`)
                    res.end()
                }
            },
            {
                path: /\/user\/[a-zA-Z0-9\-o]+/, isRegex: true, handle(req, res) {
                    res.writeHead(200, { "Content-Type": "text/plain" })
                    res.write(`Especial Route: /user/${pathname.split("/")[2]}`)
                    res.end()
                }
            },
        ],
        "POST": [],
        "PUT": [],
        "DELETE": [],
    }

    const handle = routes[method]?.find(r => (r.isRegex ? r.path.exec(pathname) : false) || (r.path === pathname))?.handle

    if (handle) {
        handle(req, res)
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" })
        res.write(`Route Not Found!`)
        res.end()
    }
}
