export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({
    success: false,
    message: 'A record with this email, student ID, or attendance already exists'
  });
  if (err.name === 'ValidationError') return res.status(400).json({
    success: false,
    message: Object.values(err.errors).map(e => e.message).join(', ')
  });
  if (err.name === 'CastError') return res.status(400).json({
    success: false,
    message: 'Invalid record ID'
  });
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
}
