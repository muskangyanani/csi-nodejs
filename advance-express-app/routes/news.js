const express = require('express');
const axios = require('axios');
const { param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory cache for news data (in production, use Redis)
const newsCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Available news categories
const VALID_CATEGORIES = [
  'business', 'entertainment', 'general', 'health', 
  'science', 'sports', 'technology'
];

// Validation middleware
const validateCategory = [
  param('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`)
];

const validateNewsQuery = [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters')
    .isAlpha()
    .withMessage('Country code must contain only letters'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
];

// Helper function to get news from API
const getNewsFromAPI = async (endpoint, params) => {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new AppError('News API key not configured', 500);
  }

  try {
    const response = await axios.get(`https://newsapi.org/v2/${endpoint}`, {
      params: {
        ...params,
        apiKey: apiKey
      },
      timeout: 10000 // 10 second timeout
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'News API error';
      
      if (status === 401) {
        throw new AppError('Invalid news API key', 500);
      } else if (status === 429) {
        throw new AppError('News API rate limit exceeded', 429);
      } else if (status === 400) {
        throw new ValidationError(`News API error: ${message}`);
      } else {
        throw new AppError(`News API error: ${message}`, 502);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new AppError('News API timeout', 504);
    } else {
      throw new AppError('Failed to fetch news data', 502);
    }
  }
};

// Helper function to format news data
const formatNewsData = (articles) => {
  return articles.map(article => ({
    title: article.title,
    description: article.description,
    content: article.content,
    author: article.author,
    source: {
      name: article.source.name,
      id: article.source.id
    },
    url: article.url,
    urlToImage: article.urlToImage,
    publishedAt: article.publishedAt,
    category: article.category || null
  })).filter(article => 
    article.title && 
    article.title !== '[Removed]' && 
    article.description && 
    article.description !== '[Removed]'
  );
};

// Get top headlines
router.get('/', validateNewsQuery, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { 
    country = 'us', 
    pageSize = 20, 
    page = 1,
    q: searchQuery
  } = req.query;

  // Create cache key
  const cacheKey = `headlines-${country}-${pageSize}-${page}-${searchQuery || 'none'}`;
  
  // Check cache first
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return res.json({
      success: true,
      ...cached.data,
      cached: true,
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000)
    });
  }

  const params = {
    country,
    pageSize: Math.min(pageSize, 100),
    page
  };

  if (searchQuery) {
    params.q = searchQuery;
  }

  // Fetch from API
  const newsData = await getNewsFromAPI('top-headlines', params);
  const formattedArticles = formatNewsData(newsData.articles);

  const result = {
    articles: formattedArticles,
    totalResults: newsData.totalResults,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(newsData.totalResults / pageSize),
    country,
    searchQuery: searchQuery || null,
    lastUpdated: new Date().toISOString()
  };

  // Cache the result
  newsCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  res.json({
    success: true,
    ...result,
    cached: false
  });
}));

// Get news by category
router.get('/:category', validateCategory, validateNewsQuery, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { category } = req.params;
  const { 
    country = 'us', 
    pageSize = 20, 
    page = 1 
  } = req.query;

  // Create cache key
  const cacheKey = `category-${category}-${country}-${pageSize}-${page}`;
  
  // Check cache first
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return res.json({
      success: true,
      ...cached.data,
      cached: true,
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000)
    });
  }

  // Fetch from API
  const newsData = await getNewsFromAPI('top-headlines', {
    category,
    country,
    pageSize: Math.min(pageSize, 100),
    page
  });

  const formattedArticles = formatNewsData(newsData.articles);

  const result = {
    articles: formattedArticles,
    totalResults: newsData.totalResults,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(newsData.totalResults / pageSize),
    category,
    country,
    lastUpdated: new Date().toISOString()
  };

  // Cache the result
  newsCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  res.json({
    success: true,
    ...result,
    cached: false
  });
}));

// Search news articles
router.get('/search/:query', validateNewsQuery, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { query: searchQuery } = req.params;
  const { 
    pageSize = 20, 
    page = 1,
    sortBy = 'publishedAt',
    language = 'en'
  } = req.query;

  if (!searchQuery || searchQuery.trim().length < 2) {
    throw new ValidationError('Search query must be at least 2 characters long');
  }

  // Create cache key
  const cacheKey = `search-${searchQuery}-${pageSize}-${page}-${sortBy}-${language}`;
  
  // Check cache first
  const cached = newsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return res.json({
      success: true,
      ...cached.data,
      cached: true,
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000)
    });
  }

  // Fetch from API
  const newsData = await getNewsFromAPI('everything', {
    q: searchQuery,
    pageSize: Math.min(pageSize, 100),
    page,
    sortBy,
    language
  });

  const formattedArticles = formatNewsData(newsData.articles);

  const result = {
    articles: formattedArticles,
    totalResults: newsData.totalResults,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(newsData.totalResults / pageSize),
    searchQuery,
    sortBy,
    language,
    lastUpdated: new Date().toISOString()
  };

  // Cache the result
  newsCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  res.json({
    success: true,
    ...result,
    cached: false
  });
}));

// Get available categories
router.get('/meta/categories', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    categories: VALID_CATEGORIES.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} news and articles`
    })),
    total: VALID_CATEGORIES.length
  });
}));

// Clear news cache
router.delete('/cache', asyncHandler(async (req, res) => {
  const cacheSize = newsCache.size;
  newsCache.clear();
  
  res.json({
    success: true,
    message: 'News cache cleared',
    clearedEntries: cacheSize
  });
}));

module.exports = router;
