const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { isAuthenticated, getCurrentUser } = require('../middleware/auth');
const { validateBlogPost, validateComment } = require('../middleware/validation');

// Apply getCurrentUser middleware to all routes to check if user is logged in
router.use(getCurrentUser);

// Get all blog posts (public)
router.get('/', blogController.getAllPosts);

// Get single blog post (public)
router.get('/:slug', blogController.getPost);

// Create new blog post (authenticated)
router.get('/create', isAuthenticated, blogController.showCreateForm);
router.post('/create', isAuthenticated, validateBlogPost, blogController.createPost);

// Edit blog post (authenticated)
router.get('/:id/edit', isAuthenticated, blogController.showEditForm);
router.put('/:id', isAuthenticated, validateBlogPost, blogController.updatePost);
router.post('/:id/edit', isAuthenticated, validateBlogPost, blogController.updatePost);

// Delete blog post (authenticated)
router.delete('/:id', isAuthenticated, blogController.deletePost);
router.post('/:id/delete', isAuthenticated, blogController.deletePost);

// Add comment to blog post (authenticated)
router.post('/:id/comment', isAuthenticated, validateComment, blogController.addComment);

module.exports = router;
