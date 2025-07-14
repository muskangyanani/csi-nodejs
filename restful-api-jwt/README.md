# RESTful API with JWT Authentication

A comprehensive, production-ready RESTful API built with Node.js, Express, and JSON Web Tokens (JWT) featuring complete CRUD operations, secure authentication, and role-based access controls.

## Features

- **🔐 JWT Authentication**: Secure access and refresh tokens with proper token management
- **👥 Role-Based Access Control**: Admin and user roles with distinct permissions
- **🛠️ Complete CRUD Operations**: Full Create, Read, Update, Delete functionality for users and products
- **🔒 Protected Routes**: Multiple authentication middleware layers
- **👤 Profile Management**: User profile updates and secure password changes
- **📦 Product Management**: User-owned products with ownership validation
- **🔍 Input Validation**: Comprehensive data validation and sanitization
- **🛡️ Security Features**: Password hashing, token blacklisting, and secure headers
- **📊 Statistics & Analytics**: User and product statistics endpoints
- **🧪 Comprehensive Testing**: Full test suite for all functionality

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://your-repo-url.git
   cd restful-api-jwt
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration**:

   Create a `.env` file in the root directory and specify your environment variables. Example:

   ```plaintext
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Start the Server**:

   ```bash
   npm run dev
   ```

   Server will run with Nodemon for live-reloading during development.

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in an existing user.
- `POST /api/auth/refresh`: Refresh access token using a refresh token.
- `POST /api/auth/logout`: Logout user (requires authentication).
- `GET /api/auth/profile`: Get user profile (requires authentication).
- `PUT /api/auth/profile`: Update user profile (requires authentication).
- `POST /api/auth/change-password`: Change user password (requires authentication).

### User Endpoints (Admin Only)

- `GET /api/users`: Retrieve all users.
- `POST /api/users`: Create a new user.
- `GET /api/users/:id`: Retrieve a user by ID.
- `PUT /api/users/:id`: Update a user by ID.
- `DELETE /api/users/:id`: Delete a user by ID.
- `POST /api/users/:id/activate`: Activate a user.
- `POST /api/users/:id/deactivate`: Deactivate a user.

### Product Endpoints

- `GET /api/products`: Retrieve all products (public).
- `GET /api/products/:id`: Retrieve a product by ID (public).
- `POST /api/products`: Create a new product (requires authentication).
- `PUT /api/products/:id`: Update a product by ID (requires ownership or admin).
- `DELETE /api/products/:id`: Delete a product by ID (requires ownership or admin).
- `GET /api/products/stats`: Get product statistics (requires authentication).
- `GET /api/products/my`: Get user-specific products (requires authentication).

## Testing

Run the comprehensive test script to validate all features:

```bash
node test-jwt-api.js
```

This will cover authentication, authorization, CRUD operations, and error handling.

## Security

- **JWT Authentication**: Protected routes with bearer token support.
- **Password Hashing**: Secure password storage using BcryptJS.
- **Role-Based Access Control**: Different permissions for admin and regular users.

## Tools and Libraries

- **Express.js**: Web application framework.
- **JWT**: JSON Web Tokens for authentication.
- **BcryptJS**: Secure password hashing.
- **Dotenv**: Environment variable management.
- **Nodemon**: Development tool for auto-reloading.
- **Axios**: Promise-based HTTP client for testing.

## License

This project is licensed under the ISC License.
