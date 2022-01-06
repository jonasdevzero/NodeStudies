import http from "http"
import Router from "./router.js"
import fs from "fs"
import path from "path"

const port = process.env.PORT || 5000
const router = new Router()

const server = http.createServer((req, res) => router.lookup(req, res))

router.get("/", (req, res) => {
    fs.readFile(path.join(process.cwd(), "src", "index.html"), (err, data) => {
        if (err) {
            res.status(500).send(err)
        }

        res.raw.writeHead(200, { "Content-Type": "text/html" })
        res.raw.end(data)
    })
})

router.get("/video", (req, res) => {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    const videoPath = path.join(process.cwd(), "src", "video.mp4");
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.raw.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res.raw);
});

server.listen(port, () => console.log("server running at", port))
