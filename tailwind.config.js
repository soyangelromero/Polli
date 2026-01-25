/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                claude: {
                    bg: "var(--claude-bg)",
                    sidebar: "var(--claude-sidebar)",
                    user: "var(--claude-user-msg)",
                    ai: "var(--claude-ai-msg)",
                    accent: "var(--claude-accent)",
                }
            }
        },
    },
    plugins: [],
};
