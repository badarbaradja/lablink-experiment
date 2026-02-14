import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        // Background & Foreground
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Primary Brand - Deep Maroon
        primary: {
          DEFAULT: "#7f1d1d", // Red 900 - Deep Maroon
          foreground: "#ffffff",
          hover: "#991b1b", // Red 800
        },
        
        // Accent Colors
        accent: {
          DEFAULT: "#dc2626", // Red 600
          foreground: "#ffffff",
        },
        
        // Card & Content
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        
        // Input Elements
        input: {
          DEFAULT: "var(--input)",
          foreground: "var(--input-foreground)",
          border: "var(--input-border)",
          placeholder: "var(--input-placeholder)",
        },
        
        // Sidebar
        sidebar: {
          DEFAULT: "var(--sidebar-bg)",
          foreground: "var(--sidebar-fg)",
          hover: "var(--sidebar-hover)",
          active: "var(--sidebar-active)",
        },
        
        // Muted Elements
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        
        // Border & Ring
        border: "var(--border)",
        ring: "var(--ring)",
        
        // Semantic Colors (tetap vibrant untuk feedback)
        success: {
          DEFAULT: "#16a34a", // Green 600
          light: "#dcfce7", // Green 100
        },
        warning: {
          DEFAULT: "#ea580c", // Orange 600
          light: "#fed7aa", // Orange 200
        },
        error: {
          DEFAULT: "#dc2626", // Red 600
          light: "#fee2e2", // Red 100
        },
        info: {
          DEFAULT: "#0284c7", // Sky 600
          light: "#e0f2fe", // Sky 100
        },
      },
      
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  
  plugins: [],
};

export default config;