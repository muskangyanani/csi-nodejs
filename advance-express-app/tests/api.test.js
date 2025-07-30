const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Welcome to Advanced Express.js Application');
      expect(res.body).toHaveProperty('features');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Route not found');
      expect(res.body).toHaveProperty('availableEndpoints');
    });
  });

  describe('Upload Routes', () => {
    describe('GET /api/upload', () => {
      it('should return empty file list initially', async () => {
        const res = await request(app).get('/api/upload');
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('files');
        expect(res.body).toHaveProperty('total');
      });
    });

    describe('POST /api/upload/single', () => {
      it('should fail without file', async () => {
        const res = await request(app)
          .post('/api/upload/single')
          .field('description', 'Test description');
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('No file uploaded');
      });
    });
  });

  describe('Weather Routes', () => {
    describe('GET /api/weather/:city', () => {
      it('should fail without API key', async () => {
        const res = await request(app).get('/api/weather/london');
        
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Weather API key not configured');
      });

      it('should validate city parameter', async () => {
        const res = await request(app).get('/api/weather/a');
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('success', false);
      });
    });
  });

  describe('News Routes', () => {
    describe('GET /api/news', () => {
      it('should fail without API key', async () => {
        const res = await request(app).get('/api/news');
        
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('News API key not configured');
      });
    });

    describe('GET /api/news/meta/categories', () => {
      it('should return available categories', async () => {
        const res = await request(app).get('/api/news/meta/categories');
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('categories');
        expect(Array.isArray(res.body.categories)).toBe(true);
        expect(res.body.categories.length).toBeGreaterThan(0);
      });
    });
  });
});
