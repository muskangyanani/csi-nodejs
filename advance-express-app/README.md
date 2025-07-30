# Advanced Express.js Application

A comprehensive Express.js application featuring:
- 📁 File upload with image processing
- 🛡️ Advanced error handling
- 🌐 Third-party API integration
- 🔒 Security middleware
- ⚡ Rate limiting
- ✅ Input validation
- 📊 Logging

## Features

### File Upload
- Multi-file upload support
- Image processing with Sharp
- File type validation
- Size limits

### Error Handling
- Global error handler
- Custom error classes
- Async error catching
- Detailed error responses

### Third-party API Integration
- Weather API integration
- News API integration
- Error handling for external APIs
- Response caching

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your API keys:
```env
PORT=3000
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
```

3. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/uploads/:filename` - Get uploaded file

### Weather API
- `GET /api/weather/:city` - Get weather for a city

### News API
- `GET /api/news` - Get latest news
- `GET /api/news/:category` - Get news by category

### Health Check
- `GET /health` - Application health status

## Project Structure

```
├── server.js              # Main application file
├── middleware/             # Custom middleware
├── routes/                 # Route handlers
├── utils/                  # Utility functions
├── uploads/                # Uploaded files directory
├── public/                 # Static files
└── tests/                  # Test files
```
