"use strict";

const http = require("http");

const PORT = Number(process.env.PORT || 3000);
const ORG_SLUG = process.env.ORG_SLUG || "demo";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, orgSlug: ORG_SLUG }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>Org Console — ${ORG_SLUG}</title></head>
<body style="font-family:system-ui;margin:2rem">
  <h1>Org Console (stub)</h1>
  <p>org-slug: <strong>${ORG_SLUG}</strong></p>
  <p>このページは Mac mini 上の Org Console スタブです。正本データはローカルにあります。</p>
</body></html>`);
});

server.listen(PORT, () => {
  console.log(`org-console-stub listening on :${PORT} slug=${ORG_SLUG}`);
});
