import { readFile } from "fs/promises";
import * as http from "http";
import * as url from "url";
import Database from "./database.js";
import path from "path";

// A basic server function to implement a simple RESTful API.
async function basicServer(request, response) {
  // Parse the URL to get the pathname and the query parameters.
  const parsedUrl = url.parse(request.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  // Grab the HTTP method.
  const method = request.method;

  if (method === "POST" && pathname === "/wordScore") {
    console.log("hello");
    // Create a new database instance.
    const database = await Database("scrabble");
    // TASK #10: Implement the /wordScore endpoint.
    // Add your implementation here.
    let name = query.name;
    let word = query.word;
    let score = query.score;
    await database.saveWordScore(name,word,score);
    response.writeHead(200);
    response.end();
  } else if (method === "GET" && pathname === "/highestWordScores") {
    console.log("GET /highestWordScores");
    // Create a new database instance.
    const database = await Database("scrabble");
    // TASK #11: Implement the /highestWordScores endpoint.
    // Add your implementation here.
      let results = await database.top10WordScores();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(results.data));
  } else if (method === "POST" && pathname === "/gameScore") {
    // Create a new database instance.
    const database = await Database("scrabble");
    let name = query.name;
    let score = query.score;
    // TASK #12: Implement the /gameScore endpoint.
    // Add your implementation here.
    await database.saveGameScore(name,score);
    response.writeHead(200);
    response.end();
  } else if (method === "GET" && pathname === "/highestGameScores") {
    console.log("GET /highestGameScores");
    // Create a new database instance.
    const database = await Database("scrabble");
    // TASK #13: Implement the /highestGameScores endpoint.
    // Add your implementation here.
    let results = await database.top10GameScores();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(results.data));
  } else {
    // This part handles the static files. If we do not match any of the routes
    // above, we assume it is a static file and serve it from the 'client'
    // directory. This means we need to read the file from the file system and
    // send it back to the client.

    // Helper function to read a file and send it back to the client.
    const sendIt = async (pathname, type) => {
      // The client files are found in the client directory, so we must prepend
      // the client path to the file requested. We also recognize the meaning of
      // a '/' to refer to the index.html file.
      const file = pathname === "/" ? "index.html" : pathname;
      try {
        const data = await readFile(
          path.join(
            path.dirname(url.fileURLToPath(import.meta.url)),
            "..",
            "client",
            file,
          ),
          "utf8",
        );
        response.writeHead(200, { "Content-Type": type });
        response.write(data);
      } catch (err) {
        response.statusCode = 404;
        response.write("Not found");
      }
      response.end();
    };

    // Determine the content type of the requested file (if it is a file).
    if (pathname.endsWith(".css")) {
      sendIt(pathname, "text/css");
    } else if (pathname.endsWith(".js")) {
      sendIt(pathname, "text/javascript");
    } else if (pathname.endsWith(".json")) {
      sendIt(pathname, "application/json");
    } else if (pathname.endsWith(".html")) {
      sendIt(pathname, "text/html");
    } else if (pathname.endsWith("/")) {
      sendIt(pathname, "text/html");
    } else {
      sendIt(pathname, "text/plain");
    }
  }
}

// Start the server on port 3260.
http.createServer(basicServer).listen(3260, () => {
  console.log("Server started on port 3260");
});
