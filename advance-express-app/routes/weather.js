const express = require('express');
const axios = require('axios');
const { param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory cache for weather data (in production, use Redis)
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Validation middleware
const validateCity = [
  param('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('City name can only contain letters, spaces, hyphens, and apostrophes')
];

const validateWeatherQuery = [
  query('units')
    .optional()
    .isIn(['metric', 'imperial', 'kelvin'])
    .withMessage('Units must be metric, imperial, or kelvin'),
  query('lang')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Language code must be 2 characters')
];

// Helper function to get weather from API
const getWeatherFromAPI = async (city, options = {}) => {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new AppError('Weather API key not configured', 500);
  }

  const { units = 'metric', lang = 'en' } = options;
  
  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: apiKey,
        units: units,
        lang: lang
      },
      timeout: 5000 // 5 second timeout
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'Weather API error';
      
      if (status === 404) {
        throw new ValidationError(`City "${city}" not found`);
      } else if (status === 401) {
        throw new AppError('Invalid weather API key', 500);
      } else if (status === 429) {
        throw new AppError('Weather API rate limit exceeded', 429);
      } else {
        throw new AppError(`Weather API error: ${message}`, 502);
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new AppError('Weather API timeout', 504);
    } else {
      throw new AppError('Failed to fetch weather data', 502);
    }
  }
};

// Helper function to format weather data
const formatWeatherData = (data, city) => {
  return {
    city: data.name,
    country: data.sys.country,
    coordinates: {
      latitude: data.coord.lat,
      longitude: data.coord.lon
    },
    weather: {
      main: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    },
    temperature: {
      current: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      min: Math.round(data.main.temp_min),
      max: Math.round(data.main.temp_max)
    },
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : null, // Convert to km
    wind: {
      speed: data.wind?.speed || 0,
      direction: data.wind?.deg || 0,
      gust: data.wind?.gust || null
    },
    clouds: data.clouds?.all || 0,
    sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
    sunset: new Date(data.sys.sunset * 1000).toISOString(),
    timezone: data.timezone,
    lastUpdated: new Date().toISOString()
  };
};

// Get weather for a specific city
router.get('/:city', validateCity, validateWeatherQuery, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const city = req.params.city.toLowerCase();
  const { units = 'metric', lang = 'en' } = req.query;
  
  // Create cache key
  const cacheKey = `${city}-${units}-${lang}`;
  
  // Check cache first
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return res.json({
      success: true,
      data: cached.data,
      cached: true,
      cacheAge: Math.round((Date.now() - cached.timestamp) / 1000)
    });
  }

  // Fetch from API
  const weatherData = await getWeatherFromAPI(city, { units, lang });
  const formattedData = formatWeatherData(weatherData, city);

  // Cache the result
  weatherCache.set(cacheKey, {
    data: formattedData,
    timestamp: Date.now()
  });

  res.json({
    success: true,
    data: formattedData,
    cached: false
  });
}));

// Get weather for multiple cities
router.post('/bulk', asyncHandler(async (req, res) => {
  const { cities, units = 'metric', lang = 'en' } = req.body;

  if (!cities || !Array.isArray(cities) || cities.length === 0) {
    throw new ValidationError('Cities array is required and must not be empty');
  }

  if (cities.length > 10) {
    throw new ValidationError('Maximum 10 cities allowed per request');
  }

  // Validate each city
  for (const city of cities) {
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      throw new ValidationError('Each city must be a valid string with at least 2 characters');
    }
  }

  const results = await Promise.allSettled(
    cities.map(async (city) => {
      try {
        const cacheKey = `${city.toLowerCase()}-${units}-${lang}`;
        
        // Check cache first
        const cached = weatherCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
          return { city, data: cached.data, cached: true };
        }

        // Fetch from API
        const weatherData = await getWeatherFromAPI(city, { units, lang });
        const formattedData = formatWeatherData(weatherData, city);

        // Cache the result
        weatherCache.set(cacheKey, {
          data: formattedData,
          timestamp: Date.now()
        });

        return { city, data: formattedData, cached: false };
      } catch (error) {
        return { city, error: error.message };
      }
    })
  );

  const successful = results
    .filter(result => result.status === 'fulfilled' && !result.value.error)
    .map(result => result.value);

  const failed = results
    .filter(result => result.status === 'rejected' || result.value.error)
    .map(result => ({
      city: result.status === 'fulfilled' ? result.value.city : 'unknown',
      error: result.status === 'fulfilled' ? result.value.error : result.reason.message
    }));

  res.json({
    success: true,
    total: cities.length,
    successful: successful.length,
    failed: failed.length,
    data: successful,
    errors: failed
  });
}));

// Clear weather cache
router.delete('/cache', asyncHandler(async (req, res) => {
  const cacheSize = weatherCache.size;
  weatherCache.clear();
  
  res.json({
    success: true,
    message: 'Weather cache cleared',
    clearedEntries: cacheSize
  });
}));

module.exports = router;
