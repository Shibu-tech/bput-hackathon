/**
 * Validation middleware
 * @param {Object} schema - Zod schema to validate against
 * @param {string} source - Source of data to validate ('body', 'params', 'query')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let data;

      switch (source) {
        case 'body':
          data = req.body;
          break;
        case 'params':
          data = req.params;
          break;
        case 'query':
          data = req.query;
          break;
        default:
          throw new Error(`Invalid source: ${source}`);
      }

      // Parse and validate data
      const parsedData = schema.parse(data);

      // Attach parsed data to request
      req[source] = parsedData;

      next();
    } catch (error) {
      if (error.constructor.name === 'ZodError') {
        // Format Zod errors - with defensive check for error.errors
        if (error.errors && Array.isArray(error.errors)) {
          const formattedErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }));

          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
          });
        } else {
          // Fallback if error.errors is not as expected
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: [{ message: 'Validation error occurred' }]
          });
        }
      }

      next(error);
    }
  };
};

module.exports = validate;