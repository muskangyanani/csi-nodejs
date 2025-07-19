require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { getCurrentUser } = require('./middleware/auth');

// Import database connection
const connectDB = require('./config/database');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Method override middleware
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global middleware to pass user info to all templates
app.use(getCurrentUser);
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.currentUrl = req.path;
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/dashboard', dashboardRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        const BlogPost = require('./models/BlogPost');
        const recentPosts = await BlogPost.find({ status: 'published' })
            .populate('author', 'username firstName lastName')
            .sort({ publishedAt: -1 })
            .limit(6);
        
        const categories = await BlogPost.distinct('categories', { status: 'published' });
        
        res.render('index', { 
            recentPosts, 
            categories: categories.slice(0, 8) // Show first 8 categories
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('index', { recentPosts: [], categories: [] });
    }
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

// Contact page
app.get('/contact', (req, res) => {
    res.render('contact');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).render('error', { 
        message: error.message || 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
