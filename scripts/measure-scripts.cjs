// Controlled comparison: restore only math/zoom script tags to the same built pages.
// Report decoded JavaScript bytes, not compressed transfer bytes or load-time claims.
const fs = require("fs"),
  http = require("http"),
  path = require("path");
const { chromium } = require("playwright");
const root = path.resolve("_site");
(async () => {
  const home = fs.readFileSync(root + "/index.html", "utf8"),
    projects = fs.readFileSync(root + "/projects/index.html", "utf8");
  const tags = [...home.matchAll(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/g), ...projects.matchAll(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/g)]
    .map((m) => m[0])
    .filter((s) => /medium-zoom|zoom\.js|mathjax|tex-mml-chtml|polyfill/i.test(s));
  const unique = [...new Set(tags)];
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, "http://localhost");
      let f = path.join(root, decodeURIComponent(u.pathname));
      if (!f.startsWith(root + path.sep) && f !== root) {
        res.writeHead(403).end();
        return;
      }
      if (fs.statSync(f).isDirectory()) f += "/index.html";
      let body = fs.readFileSync(f);
      if (f.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html");
        if (u.searchParams.has("baseline")) {
          let s = body.toString();
          s = s.replace("</body>", unique.filter((t) => !s.includes(t.match(/src="([^"]+)/)[1])).join("") + "</body>");
          body = Buffer.from(s);
        }
      } else res.setHeader("Content-Type", f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : "application/octet-stream");
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch(process.env.CHROME_CHANNEL ? { channel: process.env.CHROME_CHANNEL } : {});
  const results = [];
  try {
    for (const route of ["/", "/publications/", "/projects/", "/cv/"]) {
      for (const mode of ["baseline", "after"]) {
        const ctx = await browser.newContext();
        const p = await ctx.newPage();
        const js = [];
        const pending = [];
        p.on("response", (r) => {
          if (r.request().resourceType() === "script")
            pending.push(
              r
                .body()
                .then((b) => js.push({ url: r.url(), bytes: b.length, status: r.status() }))
                .catch(() => {})
            );
        });
        await p.goto(`http://127.0.0.1:${server.address().port}${route}${mode === "baseline" ? "?baseline" : ""}`, { waitUntil: "networkidle" });
        await Promise.all(pending);
        const result = {
          route,
          mode,
          scriptRequests: js.length,
          decodedScriptBytes: js.reduce((a, b) => a + b.bytes, 0),
          optional: js.filter((x) => /medium-zoom|zoom\.js|mathjax|tex-mml-chtml|polyfill/i.test(x.url)),
        };
        results.push(result);
        console.log(JSON.stringify(result));
        await ctx.close();
      }
    }
  } finally {
    fs.mkdirSync("reports", { recursive: true });
    fs.writeFileSync("reports/script-loading.json", JSON.stringify(results, null, 2));
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
