/** True when login should return to /ops/console/start (company console handoff). */
export function isConsoleStartCallback(callbackPath: string): boolean {
  if (!callbackPath.startsWith("/")) return false;
  const pathOnly = callbackPath.split("?")[0] ?? callbackPath;
  return pathOnly === "/ops/console/start";
}
