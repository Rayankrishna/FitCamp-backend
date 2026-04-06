/**
 * Generic Zod validation middleware factory.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} source — which part of the request to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    // Replace the source with parsed (coerced / defaulted) data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
