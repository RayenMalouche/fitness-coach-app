// Role-Based Access Control Middleware
// Restricts routes based on user role and approval status

/**
 * Middleware to ensure user is a COACH
 */
const isCoach = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'COACH') {
    return res.status(403).json({ error: 'Access denied. Coach role required.' });
  }

  next();
};

/**
 * Middleware to ensure user is a CLIENT
 */
const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Access denied. Client role required.' });
  }

  next();
};

/**
 * Middleware to ensure user is an APPROVED CLIENT
 * Clients must be approved by coach before accessing most features
 */
const isApprovedClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Access denied. Client role required.' });
  }

  if (!req.user.approved) {
    return res.status(403).json({
      error: 'Account pending approval',
      message: 'Your account is awaiting coach approval. Please check back later.'
    });
  }

  next();
};

/**
 * Middleware to allow both COACH and APPROVED CLIENT
 */
const isCoachOrApprovedClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isValidCoach = req.user.role === 'COACH';
  const isValidClient = req.user.role === 'CLIENT' && req.user.approved;

  if (!isValidCoach && !isValidClient) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource requires coach access or approved client status.'
    });
  }

  next();
};

module.exports = {
  isCoach,
  isClient,
  isApprovedClient,
  isCoachOrApprovedClient
};