// Minimal structured logger. Swap the implementation later (e.g. pino) without
// touching call sites — everything in the codebase imports `logger`, never
// `console` directly, so redaction/formatting/log-shipping upgrades happen here only.
type LogFields = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, fields?: LogFields) {
  // level/time/message always win over a same-named key in `fields` — spread
  // fields first, not last, or a caller passing e.g. { message: "..." } (as
  // the underlying error's own message) would silently overwrite the actual
  // log message instead of just adding a field.
  const entry = {
    ...fields,
    level,
    time: new Date().toISOString(),
    message,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
