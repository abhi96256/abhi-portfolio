/**
 * Technical Expertise Content Data
 * 
 * This file contains all skills and tools for the Technical Expertise room.
 * Categorized into Frontend, Backend, Design, and Tools.
 */

export const PLATFORM_CONFIG = {
    frontend: {
        color: '#4A90E2',
        accentColor: '#2d6cb5',
        icon: '⚛️',
        label: 'Frontend Architecture',
        shape: 'monitor',
    },
    backend: {
        color: '#7ED321',
        accentColor: '#5a9b13',
        icon: '⚙️',
        label: 'Backend & Cloud',
        shape: 'tv',
    },
    design: {
        color: '#BD10E0',
        accentColor: '#8a0a9e',
        icon: '🎨',
        label: 'Design & UX',
        shape: 'monitor',
    },
    tool: {
        color: '#F5A623',
        accentColor: '#c4821a',
        icon: '🛠️',
        label: 'Mastered Tools',
        shape: 'phone',
    },
};

const RAW_CONTENT_DATA = [
    // ============ Frontend Architecture ============
    {
        id: 'fe-001',
        category: 'frontend',
        platform: 'frontend',
        title: 'React / Next.js',
        percentage: 95,
        description: 'Advanced expertise in building modern, scalable SPAs and SSR applications using React and the Next.js framework.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'fe-002',
        category: 'frontend',
        platform: 'frontend',
        title: 'TypeScript',
        percentage: 90,
        description: 'Strong proficiency in using TypeScript for type-safe development, improving code quality and maintainability.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'fe-003',
        category: 'frontend',
        platform: 'frontend',
        title: 'Tailwind CSS',
        percentage: 85,
        description: 'Expertise in utility-first CSS for rapid UI development and maintaining consistent design systems.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },

    // ============ Backend & Cloud ============
    {
        id: 'be-001',
        category: 'backend',
        platform: 'backend',
        title: 'Node.js',
        percentage: 80,
        description: 'Building robust server-side applications and RESTful APIs using Node.js and Express.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'be-002',
        category: 'backend',
        platform: 'backend',
        title: 'MongoDB',
        percentage: 93,
        description: 'Extensive experience with NoSQL database design and complex aggregations.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'be-003',
        category: 'backend',
        platform: 'backend',
        title: 'MySQL',
        percentage: 90,
        description: 'Deep understanding of relational database management and query optimization.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'be-004',
        category: 'backend',
        platform: 'backend',
        title: 'PHP / Laravel',
        percentage: 70,
        description: 'Proficient in developing enterprise-grade applications with the Laravel framework.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'be-005',
        category: 'backend',
        platform: 'backend',
        title: 'PostgreSQL',
        percentage: 75,
        description: 'Working with advanced SQL features and spatial data.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'be-006',
        category: 'backend',
        platform: 'backend',
        title: 'AWS / Vercel',
        percentage: 70,
        description: 'Deploying and managing cloud infrastructure and serverless functions.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },

    // ============ Design & UX ============
    {
        id: 'ds-001',
        category: 'design',
        platform: 'design',
        title: 'Figma',
        percentage: 85,
        description: 'Designing high-fidelity wireframes, prototypes, and user interfaces.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'ds-002',
        category: 'design',
        platform: 'design',
        title: 'Framer Motion',
        percentage: 90,
        description: 'Creating smooth, declarative animations for React applications.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'ds-003',
        category: 'design',
        platform: 'design',
        title: 'System Design',
        percentage: 80,
        description: 'Architecting scalable and resilient software systems.',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },

    // ============ Mastered Tools ============
    {
        id: 'tl-001',
        category: 'tool',
        platform: 'tool',
        title: 'React',
        icon: 'React',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-002',
        category: 'tool',
        platform: 'tool',
        title: 'Node.js',
        icon: 'Node',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-003',
        category: 'tool',
        platform: 'tool',
        title: 'MySQL',
        icon: 'MySQL',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-004',
        category: 'tool',
        platform: 'tool',
        title: 'Next.js',
        icon: 'Next',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-005',
        category: 'tool',
        platform: 'tool',
        title: 'Tailwind',
        icon: 'Tailwind',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-006',
        category: 'tool',
        platform: 'tool',
        title: 'MongoDB',
        icon: 'MongoDB',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-007',
        category: 'tool',
        platform: 'tool',
        title: 'PHP',
        icon: 'PHP',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-008',
        category: 'tool',
        platform: 'tool',
        title: 'Laravel',
        icon: 'Laravel',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-009',
        category: 'tool',
        platform: 'tool',
        title: 'Firebase',
        icon: 'Firebase',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
    {
        id: 'tl-010',
        category: 'tool',
        platform: 'tool',
        title: 'Figma',
        icon: 'Figma',
        url: 'https://github.com/abhi96256',
        date: '2026-05-02',
    },
];

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        // We'll handle textures dynamically in the room component for better 3D display
        frontTexture: null,
        paintedFrontTexture: null
    };
});

// Helper to get content by category
export const getContentByCategory = (category) => {
    if (category === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.category === category);
};

// Get latest content
export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
