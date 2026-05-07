// Environment variables configuration
export const env = {
  // Application Configuration
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEFAULT_LANGUAGE: import.meta.env.DEFAULT_LANGUAGE || 'es',
  SUPPORTED_LANGUAGES: import.meta.env.SUPPORTED_LANGUAGES?.split(',') || ['es', 'en'],
  
  // Contact Information
  CONTACT_EMAIL: import.meta.env.CONTACT_EMAIL || 'info@triacr.com',
  CONTACT_PHONE: import.meta.env.CONTACT_PHONE || '+50612345678',
  WHATSAPP_NUMBER: import.meta.env.WHATSAPP_NUMBER || '+50612345678',
  
  // Company Information
  COMPANY_NAME: import.meta.env.COMPANY_NAME || 'tria',
  COMPANY_WEBSITE: import.meta.env.COMPANY_WEBSITE || 'www.triacr.com',
  COMPANY_DESCRIPTION: import.meta.env.COMPANY_DESCRIPTION || 'Software Development Company',
  
  // Location Information
  COSTA_RICA_ADDRESS: import.meta.env.COSTA_RICA_ADDRESS || 'San José, Costa Rica',
  COSTA_RICA_LATITUDE: import.meta.env.COSTA_RICA_LATITUDE || '9.9281',
  COSTA_RICA_LONGITUDE: import.meta.env.COSTA_RICA_LONGITUDE || '-84.0907',
  
  // Social Media Configuration
  SOCIAL_INSTAGRAM: import.meta.env.SOCIAL_INSTAGRAM || 'https://instagram.com/triacr',
  SOCIAL_FACEBOOK: import.meta.env.SOCIAL_FACEBOOK || 'https://facebook.com/triacr',
  SOCIAL_LINKEDIN: import.meta.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company/triacr',
  SOCIAL_GITHUB: import.meta.env.SOCIAL_GITHUB || 'https://github.com/triacr',
  SOCIAL_TWITTER: import.meta.env.SOCIAL_TWITTER || 'https://twitter.com/triacr',
  
  // Development Configuration
  DEBUG_MODE: import.meta.env.DEBUG_MODE === 'true',
  LOG_LEVEL: import.meta.env.LOG_LEVEL || 'info',
  API_BASE_URL: import.meta.env.API_BASE_URL || 'http://localhost:4321/api',
  
  // Analytics & Tracking
  GOOGLE_ANALYTICS_ID: import.meta.env.GOOGLE_ANALYTICS_ID || '',
  HOTJAR_ID: import.meta.env.HOTJAR_ID || '',
  SENTRY_DSN: import.meta.env.SENTRY_DSN || '',
  
  // Security Configuration
  JWT_SECRET: import.meta.env.JWT_SECRET || '',
  ENCRYPTION_KEY: import.meta.env.ENCRYPTION_KEY || ''
};
