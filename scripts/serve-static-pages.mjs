import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "out");
const requestedBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/AIBTI";
const basePath = `/${requestedBasePath.replace(/^\/+|\/+$/g, "")}`;
const host = process.env.PAGES_SMOKE_HOST ?? "127.0.0.1";
const port = Number(process.env.PAGES_SMOKE_PORT ?? 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const send = (response, status, body, headers = {}) => {
  response.writeHead(status, { "Cache-Control": "no-store", ...headers });
  response.end(body);
};

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${host}:${port}`).pathname);
  } catch {
    send(response, 400, "Bad request");
    return;
  }

  if (pathname === "/") {
    response.writeHead(302, { Location: `${basePath}/`, "Cache-Control": "no-store" });
    response.end();
    return;
  }
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    send(response, 404, "Not found");
    return;
  }

  const relativePath = pathname.slice(basePath.length).replace(/^\/+/, "");
  let candidate = relativePath && !pathname.endsWith("/")
    ? resolve(root, relativePath)
    : resolve(root, relativePath, "index.html");
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = resolve(candidate, "index.html");

  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    send(response, 403, "Forbidden");
    return;
  }
  if (!existsSync(candidate) || !statSync(candidate).isFile()) {
    send(response, 404, "Not found");
    return;
  }

  const headers = {
    "Content-Type": contentTypes[extname(candidate).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": statSync(candidate).size,
  };
  response.writeHead(200, { "Cache-Control": "no-store", ...headers });
  if (request.method === "HEAD") response.end();
  else createReadStream(candidate).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(`AIBTI Pages smoke server: http://${host}:${port}${basePath}/\n`);
});
