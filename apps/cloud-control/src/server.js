"use strict";

const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8080);
const CLOUD_DOMAIN = process.env.CLOUD_DOMAIN || "southwood.cloud";
const CONTROL_HOST = process.env.CONTROL_HOST || `control.${CLOUD_DOMAIN}`;
const DASH_HOST = process.env.DASH_HOST || `dash.${CLOUD_DOMAIN}`;
const AGENT_TOKEN = process.env.AGENT_TOKEN || "dev-agent-token-change-me";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 30_000);
const OAT_PROTOCOL_VERSION = "1.0";
const OAT_MAX_FRAME_BYTES = 1_048_576;
const ORG_SLUG_PATTERN = /^[a-z0-9-]{2,63}$/;

/** @type {Map<string, { ws: import('ws').WebSocket, orgSlug: string, version: string, lastSeen: number }>} */
const agentsBySlug = new Map();
/** @type {Map<string, { res: import('http').ServerResponse, timer: NodeJS.Timeout }>} */
const pendingRequests = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseOrgSlug(hostHeader) {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();
  if (host === CLOUD_DOMAIN || host === `www.${CLOUD_DOMAIN}`) return null;
  if (host === CONTROL_HOST || host === DASH_HOST) return null;
  const suffix = `.${CLOUD_DOMAIN}`;
  if (!host.endsWith(suffix)) return null;
  const slug = host.slice(0, -suffix.length);
  if (!slug || slug.includes(".")) return null;
  return slug;
}

function handleControlApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/health") {
    return json(res, 200, {
      ok: true,
      service: "cloud-control",
      domain: CLOUD_DOMAIN,
      agentsOnline: agentsBySlug.size,
    });
  }

  if (req.method === "GET" && pathname === "/api/v1/agents") {
    const agents = [...agentsBySlug.values()].map((a) => ({
      orgSlug: a.orgSlug,
      version: a.version,
      lastSeen: a.lastSeen,
      online: a.ws.readyState === 1,
    }));
    return json(res, 200, { agents });
  }

  if (req.method === "GET" && pathname.startsWith("/api/v1/orgs/")) {
    const slug = pathname.split("/")[4];
    const agent = agentsBySlug.get(slug);
    if (!agent) {
      return json(res, 404, { error: "org_not_connected", orgSlug: slug });
    }
    return json(res, 200, {
      orgSlug: slug,
      version: agent.version,
      lastSeen: agent.lastSeen,
      online: agent.ws.readyState === 1,
      consoleUrl: `https://${slug}.${CLOUD_DOMAIN}`,
    });
  }

  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><title>southwood.cloud</title></head>
<body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem">
  <h1>southwood.cloud</h1>
  <p>OrgOS Control Plane (skeleton)</p>
  <ul>
    <li><a href="https://${CONTROL_HOST}/health">Control health</a></li>
    <li><a href="https://${DASH_HOST}/">Dashboard (L3)</a></li>
  </ul>
</body></html>`);
    return;
  }

  json(res, 404, { error: "not_found" });
}

async function proxyToAgent(orgSlug, req, res) {
  const agent = agentsBySlug.get(orgSlug);
  if (!agent || agent.ws.readyState !== 1) {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Org agent offline: ${orgSlug}`);
    return;
  }

  const body = await readBody(req);
  const id = crypto.randomUUID();
  const timer = setTimeout(() => {
    if (!pendingRequests.has(id)) return;
    pendingRequests.delete(id);
    res.writeHead(504, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Org agent timeout");
  }, REQUEST_TIMEOUT_MS);

  pendingRequests.set(id, { res, timer });

  agent.ws.send(
    JSON.stringify({
      type: "request",
      id,
      method: req.method,
      path: req.url,
      headers: {
        host: req.headers.host,
        "x-forwarded-host": req.headers.host,
        "x-forwarded-proto": "https",
      },
      body: body.length ? body.toString("base64") : null,
    }),
  );
}

function handleAgentMessage(ws, raw) {
  let msg;
  try {
    msg = JSON.parse(raw.toString());
  } catch {
    return;
  }

  if (msg.type === "register") {
    if (msg.protocolVersion && msg.protocolVersion !== OAT_PROTOCOL_VERSION) {
      ws.send(JSON.stringify({ type: "error", error: "protocol_version" }));
      ws.close(4400, "protocol_version");
      return;
    }
    if (msg.token !== AGENT_TOKEN) {
      ws.send(JSON.stringify({ type: "error", error: "invalid_token" }));
      ws.close(4401, "invalid_token");
      return;
    }
    if (!msg.orgSlug || !ORG_SLUG_PATTERN.test(msg.orgSlug)) {
      ws.send(JSON.stringify({ type: "error", error: "invalid_org_slug" }));
      ws.close(4400, "invalid_org_slug");
      return;
    }
    const existing = agentsBySlug.get(msg.orgSlug);
    if (existing && existing.ws !== ws) {
      existing.ws.close(4000, "replaced_by_new_agent");
    }
    agentsBySlug.set(msg.orgSlug, {
      ws,
      orgSlug: msg.orgSlug,
      version: msg.version || "unknown",
      lastSeen: Date.now(),
    });
    ws.send(
      JSON.stringify({
        type: "registered",
        orgSlug: msg.orgSlug,
        serverTime: new Date().toISOString(),
      }),
    );
    return;
  }

  if (msg.type === "heartbeat") {
    const entry = [...agentsBySlug.entries()].find(([, a]) => a.ws === ws);
    if (entry) {
      entry[1].lastSeen = Date.now();
      entry[1].version = msg.version || entry[1].version;
    }
    ws.send(JSON.stringify({ type: "heartbeat_ack" }));
    return;
  }

  if (msg.type === "response") {
    const pending = pendingRequests.get(msg.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    pendingRequests.delete(msg.id);
    const headers = { ...(msg.headers || {}) };
    delete headers["transfer-encoding"];
    pending.res.writeHead(msg.status || 502, headers);
    pending.res.end(msg.body ? Buffer.from(msg.body, "base64") : "");
  }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || "";
  const url = new URL(req.url || "/", `http://${host}`);
  const orgSlug = parseOrgSlug(host);

  if (host.split(":")[0].toLowerCase() === CONTROL_HOST || url.pathname.startsWith("/api/")) {
    return handleControlApi(req, res, url.pathname);
  }

  if (orgSlug) {
    return proxyToAgent(orgSlug, req, res);
  }

  if (url.pathname === "/health") {
    return json(res, 200, { ok: true, service: "cloud-control" });
  }

  return handleControlApi(req, res, url.pathname);
});

const wss = new WebSocketServer({ server, path: "/api/v1/tunnel" });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(String(data));
    if (size > OAT_MAX_FRAME_BYTES) {
      ws.close(1009, "frame_too_large");
      return;
    }
    handleAgentMessage(ws, data);
  });
  ws.on("close", () => {
    for (const [slug, agent] of agentsBySlug.entries()) {
      if (agent.ws === ws) agentsBySlug.delete(slug);
    }
  });
});

server.listen(PORT, () => {
  console.log(`cloud-control listening on :${PORT} (domain=${CLOUD_DOMAIN})`);
});
