/**
 * Outbound Agent Protocol (OAT) v1.0
 * @see docs/adr/outbound-agent-protocol.md
 */

export const OAT_PROTOCOL_VERSION = "1.0" as const;
export const OAT_TUNNEL_PATH = "/api/v1/tunnel";

export const OAT_DEFAULT_HEARTBEAT_MS = 15_000;
export const OAT_OFFLINE_THRESHOLD_MS = 45_000;
export const OAT_REQUEST_TIMEOUT_MS = 30_000;
export const OAT_MAX_FRAME_BYTES = 1_048_576;

export const OAT_ORG_SLUG_PATTERN = /^[a-z0-9-]{2,63}$/;

/** Agent → Control Plane */
export type OatAgentMessage =
  | OatRegisterMessage
  | OatHeartbeatMessage
  | OatResponseMessage
  | OatTelemetryMessage;

/** Control Plane → Agent */
export type OatControlMessage =
  | OatRegisteredMessage
  | OatHeartbeatAckMessage
  | OatRequestMessage
  | OatErrorMessage;

export interface OatRegisterMessage {
  type: "register";
  protocolVersion: typeof OAT_PROTOCOL_VERSION;
  orgSlug: string;
  token: string;
  version: string;
  capabilities: ["http_proxy"];
}

export interface OatRegisteredMessage {
  type: "registered";
  orgSlug: string;
  serverTime: string;
}

export interface OatHeartbeatMessage {
  type: "heartbeat";
  version: string;
}

export interface OatHeartbeatAckMessage {
  type: "heartbeat_ack";
}

export interface OatRequestMessage {
  type: "request";
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface OatResponseMessage {
  type: "response";
  id: string;
  status: number;
  headers: Record<string, string>;
  body: string | null;
}

export interface OatTelemetryMessage {
  type: "telemetry";
  orgSlug: string;
  collectedAt: string;
  metrics: Record<string, number>;
}

export interface OatErrorMessage {
  type: "error";
  error: "invalid_token" | "invalid_org_slug" | "protocol_version";
  message?: string;
}

export function isValidOrgSlug(slug: string): boolean {
  return OAT_ORG_SLUG_PATTERN.test(slug);
}
