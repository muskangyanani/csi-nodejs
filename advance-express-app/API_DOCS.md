# API Documentation

## Overview

The Advanced Express.js Application provides a comprehensive REST API with file upload capabilities, third-party API integration, and robust error handling.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication. In a production environment, you should implement proper authentication and authorization.

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Applies to**: All `/api/*` endpoints

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

## Endpoints

### Health Check

#### GET /health

Returns the application health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### File Upload

#### POST /api/upload/single

Upload a single file.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: File to upload (required)
  - `description`: File description (optional)
  - `category`: File category - image, document, other (optional)
  - `tags`: JSON array of tags (optional)
  - `createThumbnail`: Generate thumbnail for images - true/false (optional, default: true)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "originalName": "example.jpg",
    "filename": "example-1640995200000-123456789.jpg",
    "size": 1024576,
    "mimetype": "image/jpeg",
    "url": "/uploads/example-1640995200000-123456789.jpg",
    "thumbnail": "/uploads/thumb_example-1640995200000-123456789.jpg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "description": "Sample image",
    "category": "image"
  },
  "uploadedAt": "2024-01-01T12:00:00.000Z"
}
```

#### POST /api/upload/multiple

Upload multiple files.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `files`: Array of files to upload (required)
  - Other parameters same as single upload

**Response:**
```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "files": [
    { /* file object */ },
    { /* file object */ },
    { /* file object */ }
  ],
  "uploadedAt": "2024-01-01T12:00:00.000Z"
}
```

#### GET /api/upload

List all uploaded files.

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "example.jpg",
      "size": 1024576,
      "uploadedAt": "2024-01-01T12:00:00.000Z",
      "url": "/uploads/example.jpg",
      "hasThumbnail": true
    }
  ],
  "total": 1
}
```

#### GET /api/upload/:filename

Download or view an uploaded file.

#### DELETE /api/upload/:filename

Delete an uploaded file.

### Weather API

#### GET /api/weather/:city

Get current weather for a specific city.

**Parameters:**
- `city`: City name (required)

**Query Parameters:**
- `units`: metric, imperial, or kelvin (optional, default: metric)
- `lang`: Language code (optional, default: en)

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "GB",
    "coordinates": {
      "latitude": 51.5074,
      "longitude": -0.1278
    },
    "weather": {
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d",
      "iconUrl": "https://openweathermap.org/img/wn/01d@2x.png"
    },
    "temperature": {
      "current": 20,
      "feelsLike": 18,
      "min": 15,
      "max": 25
    },
    "humidity": 65,
    "pressure": 1013,
    "wind": {
      "speed": 3.5,
      "direction": 180
    },
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  },
  "cached": false
}
```

#### POST /api/weather/bulk

Get weather for multiple cities.

**Request Body:**
```json
{
  "cities": ["London", "Paris", "New York"],
  "units": "metric",
  "lang": "en"
}
```

### News API

#### GET /api/news

Get top news headlines.

**Query Parameters:**
- `country`: Country code (optional, default: us)
- `pageSize`: Number of articles (optional, default: 20, max: 100)
- `page`: Page number (optional, default: 1)
- `q`: Search query (optional)

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description",
      "author": "Author Name",
      "source": {
        "name": "News Source",
        "id": "news-source"
      },
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "totalResults": 1000,
  "page": 1,
  "pageSize": 20,
  "totalPages": 50,
  "cached": false
}
```

#### GET /api/news/:category

Get news by category.

**Categories:** business, entertainment, general, health, science, sports, technology

#### GET /api/news/search/:query

Search news articles.

#### GET /api/news/meta/categories

Get available news categories.

## Error Codes

- **400**: Bad Request - Invalid input or validation error
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error
- **502**: Bad Gateway - External API error
- **504**: Gateway Timeout - External API timeout

## File Upload Limits

- **Max File Size**: 5MB (configurable via `MAX_FILE_SIZE` environment variable)
- **Max Files**: 10 files per request
- **Allowed Types**: 
  - Images: JPEG, PNG, GIF
  - Documents: PDF
  - (Configurable via `ALLOWED_FILE_TYPES` environment variable)

## Caching

- **Weather Data**: 10 minutes
- **News Data**: 15 minutes
- Cache can be cleared via DELETE endpoints

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- File type validation
- Request size limits
