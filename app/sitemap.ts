import { MetadataRoute } from 'next'
import { SITE_CONFIG } from './config'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: SITE_CONFIG.url,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        // Add more routes here if needed (e.g., /contact, /about, etc.)
    ]
}
