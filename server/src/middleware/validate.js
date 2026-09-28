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
      if (error.name === 'ZodError' || error.constructor.name === 'ZodError') {
        const issues = Array.isArray(error.issues) ? error.issues : (Array.isArray(error.errors) ? error.errors : []);
        if (issues.length > 0) {
          const formattedErrors = issues.map(err => ({
            field: Array.isArray(err.path) ? err.path.join('.') : '',
            message: err.message
          }));

          return res.status(400).json({
            success: false,
            message: formattedErrors[0].message || 'Validation failed',
            errors: formattedErrors
          });
        } else {
          return res.status(400).json({
            success: false,
            message: error.message || 'Validation failed',
            errors: [{ message: error.message || 'Validation error occurred' }]
          });
        }
      }

      next(error);
    }
  };
};

module.exports = validate;