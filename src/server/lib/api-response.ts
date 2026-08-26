import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "./errors";
import { logger } from "./logger";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { message: string; code: string; issues?: Record<string, string[]> };
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

function apiFailure(message: string, code: string, status: number, issues?: Record<string, string[]>) {
  return NextResponse.json<ApiFailure>(
    { success: false, error: { message, code, issues } },
    { status },
  );
}

function zodIssuesToFieldMap(error: ZodError): Record<string, string[]> {
  const issues: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    (issues[path] ??= []).push(issue.message);
  }
  return issues;
}

// Wraps a route handler so every thrown AppError (or ZodError from a raw
// `schema.parse(...)` call) becomes the standard { success, error } envelope
// instead of an unhandled 500, and every unexpected error is logged with
// full detail but never leaks internals to the client.
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ValidationError) {
        return apiFailure(error.message, error.code, error.statusCode, error.issues);
      }
      if (error instanceof AppError) {
        return apiFailure(error.message, error.code, error.statusCode);
      }
      if (error instanceof ZodError) {
        return apiFailure("Invalid input", "VALIDATION_ERROR", 400, zodIssuesToFieldMap(error));
      }
      if (error instanceof SyntaxError) {
        return apiFailure("Malformed JSON body", "VALIDATION_ERROR", 400);
      }
      logger.error("Unhandled route error", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return apiFailure("Something went wrong", "INTERNAL_ERROR", 500);
    }
  };
}
