// src/utils/imageUtils.js

// Define better-looking placeholder images for each event type
const categoryPlaceholders = {
    CONCERT: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&q=80",
    SPORTS: "https://images.unsplash.com/photo-1580383603685-3bee4adf9294?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    THEATER: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop&q=80",
    CONFERENCE: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80",
    FESTIVAL: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&q=80",
    DEFAULT: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=400&fit=crop&q=80"
};

/**
 * Check if a URL is likely a valid image URL
 * @param {string} url - URL to check
 * @returns {boolean} - Whether URL is likely a valid image URL
 */
const isValidImageUrl = (url) => {
    if (!url) return false;

    // Check if URL ends with common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerCaseUrl = url.toLowerCase();

    // Direct image URL check
    if (validExtensions.some(ext => lowerCaseUrl.endsWith(ext))) {
        return true;
    }

    // Check for image hosting services
    const imageHostingPatterns = [
        'unsplash.com',
        'imgur.com',
        'i.imgur.com',
        'cloudinary.com',
        'images.pexels.com',
        'cdn.pixabay.com'
    ];

    if (imageHostingPatterns.some(pattern => lowerCaseUrl.includes(pattern))) {
        return true;
    }

    // Reject search URLs and obviously non-image URLs
    const invalidPatterns = [
        'google.com/search',
        'bing.com/search',
        'facebook.com',
        'twitter.com',
        'linkedin.com'
    ];

    if (invalidPatterns.some(pattern => lowerCaseUrl.includes(pattern))) {
        return false;
    }

    return false;
}

/**
 * Get appropriate image URL for an event
 * @param {Object} event - Event object with imageUrl and eventType properties
 * @returns {string} - Valid image URL
 */
export const getEventImageUrl = (event) => {
    // If event is null/undefined
    if (!event) {
        return categoryPlaceholders.DEFAULT;
    }

    // If imageUrl is not provided or is invalid
    if (!event.imageUrl || !isValidImageUrl(event.imageUrl)) {
        // Return category-based placeholder based on eventType
        return event.eventType ?
            (categoryPlaceholders[event.eventType] || categoryPlaceholders.DEFAULT) :
            categoryPlaceholders.DEFAULT;
    }

    // Return the original URL if it passed validation
    return event.imageUrl;
};

/**
 * Handle image loading errors by replacing with appropriate placeholder
 * @param {Event} e - Image onError event
 * @param {string} type - Event type for category-specific placeholder
 */
export const handleImageError = (e, type) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = type ?
        (categoryPlaceholders[type] || categoryPlaceholders.DEFAULT) :
        categoryPlaceholders.DEFAULT;
};