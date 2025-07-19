const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all published blog posts with pagination
const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const search = req.query.search || '';
        const category = req.query.category || '';
        const tag = req.query.tag || '';
        
        // Build query
        let query = { status: 'published' };
        
        if (search) {
            query.$text = { $search: search };
        }
        
        if (category) {
            query.categories = { $in: [category] };
        }
        
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        const posts = await BlogPost.find(query)
            .populate('author', 'username firstName lastName')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await BlogPost.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        // Get categories and tags for filters
        const categories = await BlogPost.distinct('categories', { status: 'published' });
        const tags = await BlogPost.distinct('tags', { status: 'published' });
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                posts,
                pagination: {
                    current: page,
                    pages: totalPages,
                    total
                },
                categories,
                tags
            });
        }
        
        res.render('blog/index', {
            posts,
            pagination: {
                current: page,
                pages: totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            categories,
            tags,
            search,
            selectedCategory: category,
            selectedTag: tag
        });
    } catch (error) {
        console.error('Error getting posts:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error loading blog posts' });
    }
};

// Get single blog post
const getPost = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ 
            slug: req.params.slug, 
            status: 'published' 
        })
        .populate('author', 'username firstName lastName avatar')
        .populate('comments.author', 'username firstName lastName');
        
        if (!post) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.render('error', { message: 'Post not found' });
        }
        
        // Increment view count
        post.views += 1;
        await post.save();
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json(post);
        }
        
        res.render('blog/post', { post });
    } catch (error) {
        console.error('Error getting post:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error loading blog post' });
    }
};

// Create new blog post
const createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ errors: errors.array() });
            }
            return res.render('blog/create', { 
                errors: errors.array(), 
                formData: req.body 
            });
        }
        
        const { title, content, excerpt, categories, tags, status } = req.body;
        
        // Process categories and tags
        const processedCategories = categories ? categories.split(',').map(cat => cat.trim()) : [];
        const processedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        const post = new BlogPost({
            title,
            content,
            excerpt,
            author: req.user._id,
            categories: processedCategories,
            tags: processedTags,
            status: status || 'draft',
            publishedAt: status === 'published' ? new Date() : null
        });
        
        await post.save();
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(201).json({ 
                message: 'Post created successfully', 
                post 
            });
        }
        
        res.redirect(`/blog/${post.slug}`);
    } catch (error) {
        console.error('Error creating post:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('blog/create', { 
            errors: [{ msg: 'Server error creating post' }], 
            formData: req.body 
        });
    }
};

// Update blog post
const updatePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ errors: errors.array() });
            }
            return res.render('blog/edit', { 
                errors: errors.array(), 
                post: req.body,
                postId: req.params.id
            });
        }
        
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.render('error', { message: 'Post not found' });
        }
        
        // Check if user owns the post or is admin
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            return res.render('error', { message: 'Unauthorized' });
        }
        
        const { title, content, excerpt, categories, tags, status } = req.body;
        
        // Process categories and tags
        const processedCategories = categories ? categories.split(',').map(cat => cat.trim()) : [];
        const processedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        post.title = title;
        post.content = content;
        post.excerpt = excerpt;
        post.categories = processedCategories;
        post.tags = processedTags;
        post.status = status || post.status;
        
        if (status === 'published' && !post.publishedAt) {
            post.publishedAt = new Date();
        }
        
        await post.save();
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ 
                message: 'Post updated successfully', 
                post 
            });
        }
        
        res.redirect(`/blog/${post.slug}`);
    } catch (error) {
        console.error('Error updating post:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error updating post' });
    }
};

// Delete blog post
const deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.render('error', { message: 'Post not found' });
        }
        
        // Check if user owns the post or is admin
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            return res.render('error', { message: 'Unauthorized' });
        }
        
        await BlogPost.findByIdAndDelete(req.params.id);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ message: 'Post deleted successfully' });
        }
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error deleting post:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error deleting post' });
    }
};

// Show create form
const showCreateForm = (req, res) => {
    res.render('blog/create', { errors: [], formData: {} });
};

// Show edit form
const showEditForm = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.render('error', { message: 'Post not found' });
        }
        
        // Check if user owns the post or is admin
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.render('error', { message: 'Unauthorized' });
        }
        
        res.render('blog/edit', { 
            post: {
                ...post.toObject(),
                categories: post.categories.join(', '),
                tags: post.tags.join(', ')
            }, 
            errors: [] 
        });
    } catch (error) {
        console.error('Error loading edit form:', error);
        res.render('error', { message: 'Error loading edit form' });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await BlogPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const comment = {
            author: req.user._id,
            content,
            createdAt: new Date()
        };
        
        post.comments.push(comment);
        await post.save();
        
        // Populate the comment author for response
        await post.populate('comments.author', 'username firstName lastName');
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ 
                message: 'Comment added successfully', 
                comment: post.comments[post.comments.length - 1] 
            });
        }
        
        res.redirect(`/blog/${post.slug}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.redirect('back');
    }
};

module.exports = {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    showCreateForm,
    showEditForm,
    addComment
};
