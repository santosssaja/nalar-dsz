export class NalarError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly expose: boolean = true
  ) {
    super(message);
    this.name = "NalarError";
  }
}

export function notFound(message: string): NalarError {
  return new NalarError("NOT_FOUND", message, 404);
}

export function validation(message: string): NalarError {
  return new NalarError("VALIDATION_ERROR", message, 400);
}