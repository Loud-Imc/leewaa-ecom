import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#004a50',
                    50: '#e6f2f3',
                    100: '#cce5e6',
                    200: '#99cbcd',
                    300: '#66b1b4',
                    400: '#33979b',
                    500: '#004a50',
                    600: '#003b40',
                    700: '#002c30',
                    800: '#001e20',
                    900: '#000f10',
                },
            },
        },
    },
    plugins: [],
};

export default config;
