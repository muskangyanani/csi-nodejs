# Node.js Blog Platform

A full-featured blog platform built with Node.js, Express, and MongoDB. This application provides a complete blogging solution with user authentication, content management, and a responsive web interface.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication & Authorization**
  - User registration and login
  - Session-based authentication
  - Password hashing with bcrypt
  - Admin role support

- **Blog Management**
  - Create, read, update, and delete blog posts
  - Draft and publish functionality
  - Rich text content support
  - Auto-generated slugs from titles
  - Auto-excerpt generation

- **Content Features**
  - Categories and tags system
  - Featured images support
  - Reading time calculation
  - View tracking
  - Comment system with user authentication
  - Like/unlike functionality

- **Search & Filtering**
  - Full-text search across posts
  - Filter by categories and tags
  - Pagination support

- **Dashboard**
  - Personal dashboard for content management
  - Admin dashboard for site management

### Security Features
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Session security
- Content Security Policy

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- EJS templating engine

**Authentication & Security:**
- bcryptjs for password hashing
- express-session for session management
- connect-mongo for session storage
- express-validator for input validation
- helmet for security headers
- CORS for cross-origin requests

**File Handling:**
- Multer for file uploads
- Method-override for HTTP method support

**Development:**
- Nodemon for development server
- dotenv for environment variables

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nodejs-blog-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB:**
   - Make sure MongoDB is running on your system
   - Create a new database for the blog platform

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nodejs-blog-platform

# Session
SESSION_SECRET=your-super-secret-session-key-here

# Server
PORT=3000
NODE_ENV=development

# JWT (if using JWT authentication)
JWT_SECRET=your-jwt-secret-here
```

### Environment Variables Explained

- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption (use a strong, random string)
- `PORT`: Port number for the server (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT tokens (if implemented)

## 🎯 Usage

### Development Mode

Start the development server with auto-reload:

```bash
npm run dev
```

### Production Mode

Start the production server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Default Routes

- **Home:** `/` - Landing page with recent posts
- **Blog:** `/blog` - All published blog posts
- **Authentication:** `/auth/login` and `/auth/register`
- **Dashboard:** `/dashboard` - User dashboard (requires authentication)

## 📚 API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Blog Routes (`/blog`)
- `GET /blog` - Get all published posts (with pagination)
- `GET /blog/:slug` - Get single post by slug
- `POST /blog` - Create new post (authenticated)
- `PUT /blog/:id` - Update post (authenticated, owner/admin only)
- `DELETE /blog/:id` - Delete post (authenticated, owner/admin only)
- `POST /blog/:id/like` - Like/unlike post (authenticated)
- `POST /blog/:id/comment` - Add comment (authenticated)

### Dashboard Routes (`/dashboard`)
- `GET /dashboard` - User dashboard (authenticated)
- `GET /dashboard/posts` - User's posts (authenticated)
- `GET /dashboard/create` - Create post form (authenticated)
- `GET /dashboard/edit/:id` - Edit post form (authenticated)

## 📁 Project Structure

```
nodejs-blog-platform/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── config/
│   └── database.js        # Database connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── blogController.js  # Blog post logic
│   └── dashboardController.js # Dashboard logic
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── validation.js     # Validation middleware
├── models/
│   ├── User.js           # User model
│   └── BlogPost.js       # Blog post model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── blog.js           # Blog routes
│   └── dashboard.js      # Dashboard routes
├── views/                # EJS templates
│   ├── partials/         # Reusable template parts
│   ├── auth/             # Authentication pages
│   ├── blog/             # Blog pages
│   └── dashboard/        # Dashboard pages
└── public/               # Static files
    ├── css/              # Stylesheets
    └── js/               # Client-side JavaScript
```

## 🚦 Getting Started Guide

1. **First-time setup:**
   - Follow the installation steps above
   - Start MongoDB service
   - Run the application in development mode

2. **Create an admin user:**
   - Register a new account through `/auth/register`
   - Manually set `isAdmin: true` in the database for admin privileges

3. **Create your first blog post:**
   - Log in to your account
   - Navigate to `/dashboard`
   - Click "Create New Post"
   - Fill in the details and publish

## 🔒 Security Notes

- Always use HTTPS in production
- Set strong session secrets
- Regularly update dependencies
- Configure proper CORS settings for production
- Use environment variables for sensitive data
- Consider implementing rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the `package.json` file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify database permissions

2. **Session Issues:**
   - Make sure `SESSION_SECRET` is set in `.env`
   - Clear browser cookies if experiencing login issues

3. **Port Already in Use:**
   - Change the `PORT` in `.env` file
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill -9`

## 📞 Support

If you encounter any issues or have questions, please:
- Check the troubleshooting section above
- Review the project issues on GitHub
- Create a new issue with detailed information

---

**Happy Blogging!** 🎉
