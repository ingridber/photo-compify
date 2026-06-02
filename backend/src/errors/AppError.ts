// Base class for all application errors
export class AppError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

// ---------------------------------------
// --------- Specific error classes ---------
// ---------------------------------------

// Error 400 VALIDATION ERROR
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

// ERROR 401 UNAUTHORIZED ERROR
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication is needed') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// ERROR 403 FORBIDDEN ERROR
export class ForbiddenError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, 403, "FORBIDDEN")
    }
}

// Error 404 NOT FOUND
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, `NOT_FOUND`);
    }
}

// Error 409 CONFLICT ERROR
export class ConflictError extends AppError {
    constructor(
        message = "Resource already exists",
        code = "CONFLICT"
    ) {
        super(message, 409, code);
    }
}

// Error 500 INTERNAL SERVER ERROR
    export class InternalServerError extends AppError {
        constructor(
            message = "Internal server error",
            code = "INTERNAL_SERVER_ERROR"
        ) {
            super(message, 500, code);
        }
    }

    // Error 503 SERVICE UNAVAILABLE ERROR
    export class ServiceUnavailableError extends AppError {
        constructor(
            message = "Service temporarily unavailable",
            code = "SERVICE_UNAVAILABLE"
        ) {
            super(message, 503, code);
        }
    }