const ApiError = require('../utils/ApiError');

// Turn a Zod result into a request-body replacement plus a consistent 400.
module.exports = function validate(schema, source = 'body') {
  return function validateRequest(req, _res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.length ? issue.path.join('.') : 'form';
        if (!errors[key]) errors[key] = issue.message;
      }
      return next(new ApiError(400, 'Validation failed', errors));
    }
    if (source === 'body') req.body = result.data;
    else req.validated = result.data;
    return next();
  };
};
