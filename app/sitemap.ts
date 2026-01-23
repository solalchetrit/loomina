import { MetadataRoute } from 'next'
import { SITE_CONFIG } from './config'

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return [
        {
            url: SITE_CONFIG.url,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${SITE_CONFIG.url}/offre`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${SITE_CONFIG.url}/experience`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${SITE_CONFIG.url}/about`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: `${SITE_CONFIG.url}/faq`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: `${SITE_CONFIG.url}/contact`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${SITE_CONFIG.url}/legal`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_CONFIG.url}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_CONFIG.url}/cgv`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]
}
