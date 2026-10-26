/**
 * Request validator factory
 * Returns middleware that validates req.body against a schema object
 * Schema: { fieldName: { required, type, pattern, minLength, maxLength, message } }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
        errors.push(rules.message || `${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push(`Invalid email format for ${field}`);
          }
        }

        if (rules.type === 'phone') {
          const phoneRegex = /^[\d\s\-+()]{7,15}$/;
          if (!phoneRegex.test(String(value))) {
            errors.push(`Invalid phone number for ${field}`);
          }
        }

        if (rules.type === 'array' && !Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        }

        if (rules.minLength && String(value).trim().length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && String(value).trim().length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }

        if (rules.pattern && !rules.pattern.test(String(value))) {
          errors.push(rules.message || `${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}

module.exports = { validate };
