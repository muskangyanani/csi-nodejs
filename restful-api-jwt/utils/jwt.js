const jwt = require('jsonwebtoken');

class JWTUtils {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN;
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
  }

  // Generate access token
  generateAccessToken(payload) {
    return jwt.sign(payload, this.secret, { 
      expiresIn: this.expiresIn 
    });
  }

  // Generate refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.secret, { 
      expiresIn: this.refreshExpiresIn 
    });
  }

  // Generate both access and refresh tokens
  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Decode token without verification (for expired tokens)
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      return false;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return true;
      }
      throw error;
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new JWTUtils();
