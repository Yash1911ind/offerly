const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler: turns Mongoose / custom errors into clean JSON responses
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors;

  if (err.name === 'ValidationError') {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    message = Object.values(errors)[0];
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyValue || err.keyPattern || {});
    if (fields.includes('student') && fields.includes('job')) message = 'You have already applied to this job';
    else if (fields.includes('email')) message = 'An account with this email already exists';
    else message = `Duplicate value for ${fields.join(', ')}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };
