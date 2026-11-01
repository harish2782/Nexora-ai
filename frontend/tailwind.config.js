/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // High-tech Black & Green palette
                navy: {
                    950: '#000000', // Pitch black
                    900: '#050705', // Deep obsidian black
                    850: '#090E0A', // Dark charcoal black
                    800: '#0E1510', // Deep elevated surface
                    700: '#141E17', // Card surface
                    600: '#1C2B20', // Card borders
                    500: '#2A3F30', // Highlight borders
                    400: '#43614C', // Muted green-gray
                },
                // Emerald & Matrix Green primary brand
                violet: {
                    DEFAULT: '#10B981', // Vivid Emerald
                    light: '#34D399',   // Glowing Mint Green
                    dark: '#059669',    // Deep Forest Green
                },
                // Electric Lime / Neon Green secondary brand
                cyan: {
                    DEFAULT: '#22C55E', // Electric Green
                    light: '#86EFAC',   // Cyber Mint
                    dark: '#16A34A',    // Dark Green
                },
                // Matrix green accents
                green: {
                    neon: '#00FF66',
                    glow: '#10B981',
                    emerald: '#059669',
                    cyber: '#00E676',
                },
                // Semantic status colors
                status: {
                    matched: '#10B981',
                    missing: '#EF4444',
                    uncertain: '#F59E0B',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.25rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                glow: {
                    from: { boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' },
                    to: { boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
