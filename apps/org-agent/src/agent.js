"use strict";

const http = require("http");
const WebSocket = require("ws");

const CONTROL_PLANE_URL =
  process.env.CONTROL_PLANE_URL || "ws://cloud-control:8080/api/v1/tunnel";
const LOCAL_CONSOLE_URL =
  process.env.LOCAL_CONSOLE_URL || "http://host.docker.internal:3000";
const ORG_SLUG = process.env.ORG_SLUG || "demo";
const AGENT_TOKEN = process.env.AGENT_TOKEN || "dev-agent-token-change-me";
const AGENT_VERSION = process.env.AGENT_VERSION || "0.1.0-skeleton";
const HEARTBEAT_MS = Number(process.env.HEARTBEAT_MS || 15_000);
const RECONNECT_MS = Number(process.env.RECONNECT_MS || 5_000);
const OAT_PROTOCOL_VERSION = "1.0";

function forwardToConsole(msg) {
  return new Promise((resolve, reject) => {
    const target = new URL(msg.path || "/", LOCAL_CONSOLE_URL);
    const options = {
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: target.pathname + target.search,
      method: msg.method || "GET",
      headers: {
        ...msg.headers,
        host: target.host,
      },
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({
          status: res.statusCode || 502,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("base64"),
        });
      });
    });

    req.on("error", reject);
    if (msg.body) req.write(Buffer.from(msg.body, "base64"));
    req.end();
  });
}

function connect() {
  const ws = new WebSocket(CONTROL_PLANE_URL);

  ws.on("open", () => {
    console.log(`org-agent connected (${ORG_SLUG})`);
    ws.send(
      JSON.stringify({
        type: "register",
        protocolVersion: OAT_PROTOCOL_VERSION,
        orgSlug: ORG_SLUG,
        token: AGENT_TOKEN,
        version: AGENT_VERSION,
        capabilities: ["http_proxy"],
      }),
    );
  });

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "registered") {
      console.log(`org-agent registered (serverTime=${msg.serverTime || "?"})`);
      return;
    }

    if (msg.type === "error") {
      console.error(`org-agent error: ${msg.error}`);
      return;
    }

    if (msg.type === "request") {
      try {
        const response = await forwardToConsole(msg);
        ws.send(JSON.stringify({ type: "response", id: msg.id, ...response }));
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: "response",
            id: msg.id,
            status: 502,
            headers: { "content-type": "text/plain; charset=utf-8" },
            body: Buffer.from(String(err.message || err)).toString("base64"),
          }),
        );
      }
    }
  });

  ws.on("close", () => {
    console.log(`org-agent disconnected, retry in ${RECONNECT_MS}ms`);
    setTimeout(connect, RECONNECT_MS);
  });

  ws.on("error", (err) => {
    console.error("org-agent ws error:", err.message);
  });

  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "heartbeat", version: AGENT_VERSION }));
    }
  }, HEARTBEAT_MS);

  ws.on("close", () => clearInterval(heartbeat));
}

console.log(
  `org-agent starting slug=${ORG_SLUG} console=${LOCAL_CONSOLE_URL} control=${CONTROL_PLANE_URL}`,
);
connect();
