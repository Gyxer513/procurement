export class EntityNotFoundError extends Error {
  constructor(message = 'Entity not found') {
    super(message);
  }
}

export class DomainValidationError extends Error {
  constructor(message = 'Validation failed', public details?: any) {
    super(message);
  }
}

export class DuplicateKeyError extends Error {
  constructor(message = 'Duplicate key', public details?: any) {
    super(message);
  }
}
