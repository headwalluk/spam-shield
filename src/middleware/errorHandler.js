module.exports = (err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};
