const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 300
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    featuredImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    readTime: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from title
blogPostSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    // Calculate read time (assuming 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200);
    }
    
    // Auto-generate excerpt if not provided
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 200) + '...';
    }
    
    next();
});

// Text search index
blogPostSchema.index({ 
    title: 'text', 
    content: 'text', 
    categories: 'text', 
    tags: 'text' 
});

// Compound index for efficient queries
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ author: 1, status: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
