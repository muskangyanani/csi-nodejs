# RESTful API with Node.js and Express

A complete RESTful API built with Node.js and Express that supports CRUD operations for Users and Products.

## Features

- **Complete CRUD Operations** (Create, Read, Update, Delete)
- **Two Resources**: Users and Products
- **RESTful Design** with proper HTTP methods and status codes
- **Input Validation** with detailed error messages
- **Error Handling** middleware
- **Security** with Helmet and CORS
- **Logging** with Morgan
- **Filtering** and query parameters
- **Statistics** endpoints
- **In-memory storage** (easily replaceable with database)

## Installation

```bash
# Clone or navigate to the project directory
cd restful-api

# Install dependencies
npm install

# Start the server
npm run dev  # Development mode with auto-restart
npm start    # Production mode
```

## API Endpoints

### Base URL: `http://localhost:3000`

## Users API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user by ID |
| DELETE | `/api/users/:id` | Delete user by ID |
| GET | `/api/users/stats` | Get user statistics |

### User Schema

```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "email": "string (required, unique)",
  "age": "number (required, positive)",
  "city": "string (required)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product by ID |
| DELETE | `/api/products/:id` | Delete product by ID |
| GET | `/api/products/stats` | Get product statistics |

### Product Schema

```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required, positive)",
  "category": "string (required)",
  "inStock": "boolean (default: true)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Query Parameters

### Products Filtering

- `category`: Filter by category
- `inStock`: Filter by availability (true/false)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

Example: `GET /api/products?category=Electronics&inStock=true&minPrice=100`

## Example Usage

### Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "city": "New York"
  }'
```

### Get All Users

```bash
curl http://localhost:3000/api/users
```

### Update a User

```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 28
  }'
```

### Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "inStock": true
  }'
```

### Filter Products

```bash
curl "http://localhost:3000/api/products?category=Electronics&inStock=true"
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ },
  "count": 5 // for list endpoints
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## HTTP Status Codes

- `200` - OK (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Additional Endpoints

### Health Check

```bash
GET /health
```

Returns server health status and uptime.

### API Documentation

```bash
GET /
```

Returns comprehensive API documentation.

## Testing

Run the test script to verify all endpoints:

```bash
node test-api.js
```

This will test all CRUD operations, filtering, validation, and error handling.

## Project Structure

```
restful-api/
├── controllers/
│   ├── userController.js      # User business logic
│   └── productController.js   # Product business logic
├── data/
│   ├── userStore.js           # In-memory user storage
│   └── productStore.js        # In-memory product storage
├── middleware/
│   ├── errorHandler.js        # Error handling middleware
│   └── notFound.js            # 404 handler
├── models/
│   ├── User.js                # User model and validation
│   └── Product.js             # Product model and validation
├── routes/
│   ├── users.js               # User routes
│   └── products.js            # Product routes
├── server.js                  # Main server file
├── test-api.js                # API testing script
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Comprehensive validation
- **Error Handling**: Secure error responses

## Development Features

- **Nodemon**: Auto-restart on file changes
- **Morgan**: Request logging
- **UUID**: Unique identifiers
- **Consistent Error Handling**: Standardized error responses

## Extending the API

To add new resources:

1. Create a model in `models/`
2. Create a data store in `data/`
3. Create a controller in `controllers/`
4. Create routes in `routes/`
5. Register routes in `server.js`

## Database Integration

The current implementation uses in-memory storage for simplicity. To integrate with a database:

1. Replace the data stores with database queries
2. Add database connection configuration
3. Update models to use database schemas
4. Add database-specific error handling

## License

ISC
