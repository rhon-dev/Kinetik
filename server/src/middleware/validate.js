import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';
        validationError.details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(validationError);
      }
      next(error);
    }
  };
};
