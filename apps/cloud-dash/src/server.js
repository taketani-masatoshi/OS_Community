"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8082);
const CONTROL_PLANE_URL =
  process.env.CONTROL_PLANE_URL || "http://cloud-control:8080";

async function fetchAgents() {
  try {
    const res = await fetch(`${CONTROL_PLANE_URL}/api/v1/agents`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.agents || [];
  } catch {
    return [];
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "cloud-dash" }));
    return;
  }

  if (req.url === "/api/agents") {
    const agents = await fetchAgents();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ agents }));
    return;
  }

  const indexPath = path.join(__dirname, "..", "public", "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`cloud-dash listening on :${PORT}`);
});
