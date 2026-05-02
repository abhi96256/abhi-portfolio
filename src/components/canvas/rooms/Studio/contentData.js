/**
 * Studio Content Data
 * 
 * This file contains all content items for the Studio monitor tower.
 * Each item will be displayed on a monitor in the tower.
 * 
 * Platforms: 'youtube', 'blog', 'tiktok'
 */

export const PLATFORM_CONFIG = {
    youtube: {
        color: '#FF0000',
        accentColor: '#cc0000',
        icon: '▶',
        label: 'YouTube',
        shape: 'tv', // Wide CRT style
    },
    blog: {
        color: '#4A90D9',
        accentColor: '#2d6cb5',
        icon: '📝',
        label: 'Blog',
        shape: 'monitor', // Thin desktop monitor
    },
    tiktok: {
        color: '#00F2EA',
        accentColor: '#FF0050',
        icon: '🎵',
        label: 'TikTok',
        shape: 'phone', // Vertical phone
    },
};

// Sample content data - replace with real content later
const RAW_CONTENT_DATA = [
    // ============ Professional Links ============
    {
        id: 'link-001',
        platform: 'blog',
        title: 'LinkedIn Profile',
        description: 'Connect with me on LinkedIn for professional collaborations and networking.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/abhishek-kumar-326939291/',
        date: '2026-05-02',
        readTime: '1 min',
    },
    {
        id: 'link-002',
        platform: 'blog',
        title: 'GitHub Repository',
        description: 'Check out my code repositories and open-source contributions on GitHub.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        readTime: '1 min',
    },
    {
        id: 'link-003',
        platform: 'blog',
        title: 'WhatsApp Contact',
        description: 'Direct message me for quick inquiries or project discussions.',
        thumbnail: null,
        url: 'https://wa.me/919625613008',
        date: '2026-05-02',
        readTime: '1 min',
    },
    {
        id: 'link-004',
        platform: 'blog',
        title: 'Portfolio Projects',
        description: 'Explore a collection of 12+ full-stack and frontend projects in the Gallery room.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        readTime: '2 min',
    },
    // ============ Skills & Expertise ============
    {
        id: 'skill-001',
        platform: 'youtube',
        title: 'Full Stack Development',
        description: 'Building end-to-end solutions using React, Node.js, and PHP.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        views: 'Expert',
        duration: '3+ Years',
    },
    {
        id: 'skill-002',
        platform: 'youtube',
        title: '3D Web Experiences',
        description: 'Creating immersive 3D environments with Three.js and React Three Fiber.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        views: 'Specialist',
        duration: '1+ Year',
    },
    {
        id: 'skill-003',
        platform: 'youtube',
        title: 'Database Management',
        description: 'Designing efficient database schemas with MySQL and Supabase.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        views: 'Advanced',
        duration: '2+ Years',
    },
    {
        id: 'skill-004',
        platform: 'youtube',
        title: 'Modern Frontend',
        description: 'Developing responsive and high-performance UIs with Tailwind CSS and GSAP.',
        thumbnail: null,
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
        views: 'Master',
        duration: '3+ Years',
    },
];

const ytTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego.webp', '/textures/studio/tvfront_filmikedytowaniezdjec.webp'];
const ytPaintedTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp', '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp'];
const blogTextures = ['/textures/studio/monitorfront_postnafbdoublewinner.webp'];
const blogPaintedTextures = ['/textures/studio/monitorfront_postnafbdoublewinner_painted.webp'];
const ttTextures = ['/textures/studio/phonefront_followmeontiktok.webp'];
const ttPaintedTextures = ['/textures/studio/phonefront_followmeontiktok_painted.webp'];

let ytIdx = 0, blogIdx = 0, ttIdx = 0;
let ytPIdx = 0, blogPIdx = 0, ttPIdx = 0;

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        frontTexture: item.frontTexture || (
            item.platform === 'youtube' ? ytTextures[ytIdx++ % ytTextures.length] :
                item.platform === 'blog' ? blogTextures[blogIdx++ % blogTextures.length] :
                    ttTextures[ttIdx++ % ttTextures.length]
        ),
        paintedFrontTexture: item.paintedFrontTexture || (
            item.platform === 'youtube' ? ytPaintedTextures[ytPIdx++ % ytPaintedTextures.length] :
                item.platform === 'blog' ? blogPaintedTextures[blogPIdx++ % blogPaintedTextures.length] :
                    ttPaintedTextures[ttPIdx++ % ttPaintedTextures.length]
        )
    };
});

// Helper to get content by platform
export const getContentByPlatform = (platform) => {
    if (platform === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.platform === platform);
};

// Get latest content (for "On Air" indicator)
export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
