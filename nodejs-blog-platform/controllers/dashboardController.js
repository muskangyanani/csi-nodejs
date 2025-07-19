const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// Show dashboard
const showDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user's posts
        const posts = await BlogPost.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Get statistics
        const stats = {
            totalPosts: await BlogPost.countDocuments({ author: userId }),
            publishedPosts: await BlogPost.countDocuments({ author: userId, status: 'published' }),
            draftPosts: await BlogPost.countDocuments({ author: userId, status: 'draft' }),
            totalViews: await BlogPost.aggregate([
                { $match: { author: userId } },
                { $group: { _id: null, totalViews: { $sum: '$views' } } }
            ])
        };
        
        // Extract total views from aggregation result
        const totalViews = stats.totalViews.length > 0 ? stats.totalViews[0].totalViews : 0;
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                posts,
                stats: {
                    ...stats,
                    totalViews
                }
            });
        }
        
        res.render('dashboard/index', {
            posts,
            stats: {
                ...stats,
                totalViews
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error loading dashboard' });
    }
};

// Show user's posts
const showMyPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';
        
        let query = { author: req.user._id };
        
        if (status) {
            query.status = status;
        }
        
        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await BlogPost.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                posts,
                pagination: {
                    current: page,
                    pages: totalPages,
                    total
                }
            });
        }
        
        res.render('dashboard/posts', {
            posts,
            pagination: {
                current: page,
                pages: totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            selectedStatus: status
        });
    } catch (error) {
        console.error('My posts error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error loading your posts' });
    }
};

// Show user profile
const showProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.render('error', { message: 'User not found' });
        }
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json(user);
        }
        
        res.render('dashboard/profile', { user, errors: [] });
    } catch (error) {
        console.error('Profile error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('error', { message: 'Error loading profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, email } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.render('error', { message: 'User not found' });
        }
        
        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
                return res.render('dashboard/profile', { 
                    user: { ...user.toObject(), ...req.body }, 
                    errors: [{ msg: 'Email already taken' }] 
                });
            }
        }
        
        user.firstName = firstName;
        user.lastName = lastName;
        user.bio = bio;
        user.email = email;
        
        await user.save();
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ 
                message: 'Profile updated successfully', 
                user: user.toObject() 
            });
        }
        
        res.redirect('/dashboard/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.render('dashboard/profile', { 
            user: req.body, 
            errors: [{ msg: 'Server error updating profile' }] 
        });
    }
};

module.exports = {
    showDashboard,
    showMyPosts,
    showProfile,
    updateProfile
};
