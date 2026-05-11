import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#157fb8',
                    50: '#eef6fb',
                    100: '#dcecf7',
                    200: '#bad9ef',
                    300: '#98c6e7',
                    400: '#75b3df',
                    500: '#157fb8',
                    600: '#116693',
                    700: '#0d4c6e',
                    800: '#083349',
                    900: '#041925',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
