const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      // Get token from header (removes "Bearer " prefix)
      token = token.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user info (id and role) to the request object
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is a Librarian
const librarianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'librarian') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Librarians only' });
  }
};

module.exports = { protect, librarianOnly };