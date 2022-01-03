import http from "http"
import url from "url"
import fs from "fs/promises"
import path from "path"

const port = process.env.PORT || 8080

const allowedMimeTypes = {
    js: "application/javascript",
    css: "text/css",
}

const server = http.createServer(async (req, res) => {
    try {
        const { pathname } = url.parse(req.url)

        if (pathname.includes(".")) {
            const mimeType = allowedMimeTypes[pathname.split(".")[1]]
            if (!mimeType)
                throw new Error(`Mimetype ${mimeType} not allowed!`);

            const file = await fs.readFile(path.resolve() + pathname)

            res.writeHead(200, { "Content-Type": mimeType })
            res.write(file)
            res.end()
        } else {
            const page = await fs.readFile(path.resolve() + "/src/pages/index.html")

            res.writeHead(200, { "Content-Type": "text/html" })
            res.write(page, "utf-8")
            res.end()
        }
    } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" })
        res.write(error.toString())
        res.end()
    }
})

server.listen(port, () => console.log("Server running at", port))
