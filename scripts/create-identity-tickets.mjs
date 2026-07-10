#!/usr/bin/env node
/**
 * Create GitHub issues from docs/plans/tickets/ID-*.md
 *
 * Usage:
 *   node scripts/create-identity-tickets.mjs --dry-run
 *   node scripts/create-identity-tickets.mjs --phase mvp
 *   node scripts/create-identity-tickets.mjs --phase 6
 *   node scripts/create-identity-tickets.mjs --phase extension
 *   node scripts/create-identity-tickets.mjs --id ID-001
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = join(import.meta.dirname, "..");
const ticketsDir = join(root, "docs/plans/tickets");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const phaseFilter = args.includes("--phase") ? args[args.indexOf("--phase") + 1] : null;
const idFilter = args.includes("--id") ? args[args.indexOf("--id") + 1] : null;
const milestone =
  args.includes("--milestone") ? args[args.indexOf("--milestone") + 1] : "Identity C MVP";

const PHASE_MAP = {
  mvp: ["ID-001", "ID-002", "ID-003", "ID-004", "ID-005", "ID-006", "ID-007", "ID-008", "ID-009", "ID-010", "ID-011", "ID-012", "ID-013", "ID-014", "ID-015", "ID-016", "ID-017", "ID-018", "ID-019", "ID-020", "ID-021"],
  6: ["ID-022", "ID-023", "ID-024"],
  extension: ["ID-025", "ID-026", "ID-027"],
};

function parseTicket(filePath, fileName) {
  const raw = readFileSync(filePath, "utf8");
  const titleMatch = raw.match(/^#\s+(.+)/m);
  if (!titleMatch) throw new Error(`Missing title in ${filePath}`);
  const title = titleMatch[1].replace(/^ID-\d+:\s*/, "").trim();
  const idFromFile = fileName.replace(".md", "");

  const meta = { ID: idFromFile };
  for (const line of raw.split("\n")) {
    const m = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    if (m) meta[m[1]] = m[2].trim();
  }

  const body = raw.replace(/^#.+\n\n/, "").trim();
  return {
    title: `[${meta.ID}] ${title}`,
    body,
    labels: meta.Labels ?? "identity",
    estimate: meta.Estimate,
  };
}

function listTickets() {
  return readdirSync(ticketsDir)
    .filter((f) => f.startsWith("ID-") && f.endsWith(".md"))
    .sort();
}

const allowedIds = phaseFilter ? PHASE_MAP[phaseFilter] : null;
if (phaseFilter && !allowedIds) {
  console.error(`Unknown phase: ${phaseFilter}. Use mvp | 6 | extension`);
  process.exit(1);
}

const files = listTickets().filter((f) => {
  const idMatch = f.match(/^(ID-\d+)/);
  const id = idMatch ? idMatch[1] : f.replace(".md", "");
  if (idFilter) return id === idFilter;
  if (allowedIds) return allowedIds.includes(id);
  return true;
});

if (files.length === 0) {
  console.log("No tickets matched.");
  process.exit(0);
}

console.log(`${dryRun ? "[dry-run] " : ""}Creating ${files.length} issue(s)…\n`);

for (const file of files) {
  const ticket = parseTicket(join(ticketsDir, file), file);
  console.log(`→ ${ticket.title} (${ticket.estimate ?? "?"})`);

  if (dryRun) {
    console.log(`  labels: ${ticket.labels}`);
    continue;
  }

  const labelArgs = ticket.labels.split(",").map((l) => l.trim()).filter(Boolean).map((l) => `--label "${l}"`).join(" ");
  const cmd = `gh issue create --title ${JSON.stringify(ticket.title)} --body ${JSON.stringify(ticket.body)} ${labelArgs} --milestone ${JSON.stringify(milestone)}`;
  try {
    const url = execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
    console.log(`  ${url}`);
  } catch (e) {
    console.error(`  Failed: ${e.message}`);
    console.error(`  Run: gh auth login`);
    process.exit(1);
  }
}

console.log("\nDone.");
