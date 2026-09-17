export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  actorId?: string;
  route?: string;
  [key: string]: unknown;
}

function sanitizeContext(context?: LogContext): Record<string, unknown> {
  if (!context) return {};
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    // Prevent logging raw passwords, secrets, or raw prompt reasoning
    if (/secret|token|password|auth|reasoning/i.test(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...sanitizeContext(context),
    };

    const formatted = JSON.stringify(entry);
    if (level === "error") {
      console.error(formatted);
    } else if (level === "warn") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  },

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  },

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  },

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const errorDetails =
      error instanceof Error
        ? { errorName: error.name, errorMessage: error.message }
        : { error: String(error) };

    this.log("error", message, { ...context, ...errorDetails });
  },
};
