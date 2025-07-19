// Main JavaScript file for the blog platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeSearch();
    initializeFilters();
    initializeForms();
    initializeDeleteConfirmation();
    initializeComments();
    initializeMobileMenu();
});

// Search functionality
function initializeSearch() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#search-input');
    
    if (searchForm && searchInput) {
        // Auto-submit search form with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 3 || this.value.length === 0) {
                    searchForm.submit();
                }
            }, 500);
        });
    }
}

// Filter functionality
function initializeFilters() {
    const filterTags = document.querySelectorAll('.filter-tag');
    const categorySelect = document.querySelector('#category-select');
    const tagSelect = document.querySelector('#tag-select');
    
    // Handle filter tag clicks
    filterTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            // Update URL and reload page
            const url = new URL(window.location);
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            if (filterValue) {
                url.searchParams.set(filterType, filterValue);
            } else {
                url.searchParams.delete(filterType);
            }
            
            window.location.href = url.toString();
        });
    });
    
    // Handle category and tag selects
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const url = new URL(window.location);
            if (this.value) {
                url.searchParams.set('category', this.value);
            } else {
                url.searchParams.delete('category');
            }
            window.location.href = url.toString();
        });
    }
    
    if (tagSelect) {
        tagSelect.addEventListener('change', function() {
            const url = new URL(window.location);
            if (this.value) {
                url.searchParams.set('tag', this.value);
            } else {
                url.searchParams.delete('tag');
            }
            window.location.href = url.toString();
        });
    }
}

// Form enhancements
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add loading state to submit buttons
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Loading...';
                submitBtn.disabled = true;
                
                // Add loading spinner
                const spinner = document.createElement('span');
                spinner.className = 'loading';
                submitBtn.appendChild(spinner);
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    if (spinner.parentNode) {
                        spinner.parentNode.removeChild(spinner);
                    }
                }, 5000);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                // Remove error styling when user starts typing
                if (this.classList.contains('is-invalid')) {
                    this.classList.remove('is-invalid');
                    const feedback = this.parentNode.querySelector('.invalid-feedback');
                    if (feedback) {
                        feedback.remove();
                    }
                }
            });
        });
    });
    
    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required.';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address.';
        }
    }
    
    // Password validation
    if (field.type === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            message = 'Password must be at least 6 characters long.';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            isValid = false;
            message = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
        }
    }
    
    // Min/max length validation
    if (field.hasAttribute('minlength') && value.length < parseInt(field.getAttribute('minlength'))) {
        isValid = false;
        message = `Minimum length is ${field.getAttribute('minlength')} characters.`;
    }
    
    if (field.hasAttribute('maxlength') && value.length > parseInt(field.getAttribute('maxlength'))) {
        isValid = false;
        message = `Maximum length is ${field.getAttribute('maxlength')} characters.`;
    }
    
    // Apply validation styling
    if (!isValid) {
        field.classList.add('is-invalid');
        showFieldError(field, message);
    } else {
        field.classList.remove('is-invalid');
        hideFieldError(field);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    hideFieldError(field); // Remove existing error
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Hide field error
function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// Delete confirmation
function initializeDeleteConfirmation() {
    const deleteButtons = document.querySelectorAll('[data-confirm="delete"]');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const itemName = this.dataset.itemName || 'this item';
            const confirmMessage = `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
            
            if (confirm(confirmMessage)) {
                // If it's a form, submit it
                if (this.closest('form')) {
                    this.closest('form').submit();
                } else {
                    // If it's a link, follow it
                    window.location.href = this.href;
                }
            }
        });
    });
}

// Comments functionality
function initializeComments() {
    const commentForm = document.querySelector('#comment-form');
    const commentsList = document.querySelector('#comments-list');
    
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('[type="submit"]');
            
            // Show loading state
            submitBtn.textContent = 'Posting...';
            submitBtn.disabled = true;
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Comment added successfully') {
                    // Clear form
                    this.reset();
                    
                    // Add comment to list
                    if (commentsList && data.comment) {
                        addCommentToList(data.comment);
                    }
                    
                    // Show success message
                    showAlert('Comment posted successfully!', 'success');
                } else {
                    showAlert(data.message || 'Error posting comment', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error posting comment', 'danger');
            })
            .finally(() => {
                // Reset button
                submitBtn.textContent = 'Post Comment';
                submitBtn.disabled = false;
            });
        });
    }
}

// Add comment to list
function addCommentToList(comment) {
    const commentsList = document.querySelector('#comments-list');
    if (!commentsList) return;
    
    const commentHtml = `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.author.firstName} ${comment.author.lastName}</span>
                <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('beforeend', commentHtml);
}

// Mobile menu toggle
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Show alert messages
function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.alert-container') || document.body;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Export functions for use in other scripts
window.blogPlatform = {
    showAlert,
    formatDate,
    truncateText,
    validateField
};
