// Utility for handling image placeholders and fallbacks

/**
 * Get a placeholder image URL from a reliable CDN
 * Uses picsum.photos which works in production
 */
export const getPlaceholderImage = (width = 400, height = 500, seed = null) => {
  // Use seed for consistent random images
  const seedParam = seed ? `?random=${seed}` : `?random=${Math.floor(Math.random() * 1000)}`;
  return `https://picsum.photos/${width}/${height}${seedParam}`;
};

/**
 * Get a fashion-specific placeholder from Unsplash
 * These are high-quality fashion images
 */
export const getFashionPlaceholder = (category = 'fashion') => {
  const categories = {
    fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
    clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=500&fit=crop',
    wardrobe: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400&h=500&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=500&fit=crop',
    shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
    default: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop'
  };
  
  return categories[category] || categories.default;
};

/**
 * Handle image error by setting a placeholder
 * Usage: <img src={url} onError={handleImageError} />
 */
export const handleImageError = (e, category = 'fashion') => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = getFashionPlaceholder(category);
};

/**
 * Get image URL with fallback
 * Returns the original URL or a placeholder if URL is invalid
 */
export const getImageWithFallback = (imageUrl, category = 'fashion') => {
  if (!imageUrl || imageUrl === '' || imageUrl === 'undefined') {
    return getFashionPlaceholder(category);
  }
  return imageUrl;
};

/**
 * Create a data URL for a colored placeholder
 * Useful for instant loading before real image loads
 */
export const getColorPlaceholder = (color = '#f3f4f6', width = 400, height = 500) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#9ca3af" text-anchor="middle" dy=".3em">
        No Image
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Preload an image and return a promise
 * Useful for checking if image exists before displaying
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
};

/**
 * Get avatar placeholder with initials
 * For user profile pictures
 */
export const getAvatarPlaceholder = (name = 'User', size = 100) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0'
  ];
  
  const color = colors[name.length % colors.length];
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size/3}" fill="white" text-anchor="middle" dy=".35em" font-weight="600">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default {
  getPlaceholderImage,
  getFashionPlaceholder,
  handleImageError,
  getImageWithFallback,
  getColorPlaceholder,
  preloadImage,
  getAvatarPlaceholder
};
