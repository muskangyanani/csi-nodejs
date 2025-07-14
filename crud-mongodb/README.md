# CRUD MongoDB Application

A simple Node.js application demonstrating CRUD operations with MongoDB using Mongoose.

## Features

- Create new users
- Read all users or get a specific user by ID
- Update existing users
- Delete users
- Input validation and error handling
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

1. Clone this repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running on your local machine:
   ```bash
   mongod
   ```

4. Start the application:
   ```bash
   # For development (with auto-restart)
   npm run dev
   
   # For production
   npm start
   ```

## API Endpoints

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user by ID |
| DELETE | `/api/users/:id` | Delete user by ID |

## User Schema

```json
{
  "name": "String (required)",
  "email": "String (required, unique)",
  "age": "Number (required, min: 0)",
  "city": "String (required)"
}
```

## Example Usage

### Create a new user
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

### Get all users
```bash
curl http://localhost:3000/api/users
```

### Get user by ID
```bash
curl http://localhost:3000/api/users/USER_ID
```

### Update a user
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 28,
    "city": "Los Angeles"
  }'
```

### Delete a user
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/crud-app
PORT=3000
```

## Project Structure

```
crud-mongodb/
├── config/
│   └── database.js      # MongoDB connection configuration
├── models/
│   └── User.js          # User schema and model
├── routes/
│   └── users.js         # User routes and CRUD operations
├── app.js               # Main application file
├── package.json         # Project dependencies and scripts
├── .env                 # Environment variables
└── README.md            # This file
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid data validation
- Database connection errors
- Resource not found errors
- Server errors

All responses follow a consistent format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string"
}
```
