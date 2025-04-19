import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Vision UI Dashboard specific colors
        "vision-purple": {
          100: "rgba(161, 99, 247, 0.1)",
          200: "rgba(161, 99, 247, 0.2)",
          300: "rgba(161, 99, 247, 0.3)",
          400: "rgba(161, 99, 247, 0.4)",
          500: "rgba(161, 99, 247, 0.6)",
          600: "rgba(161, 99, 247, 0.8)",
          700: "rgba(161, 99, 247, 1)",
        },
        "vision-blue": {
          100: "rgba(24, 150, 255, 0.1)",
          200: "rgba(24, 150, 255, 0.2)",
          300: "rgba(24, 150, 255, 0.3)",
          400: "rgba(24, 150, 255, 0.4)",
          500: "rgba(24, 150, 255, 0.6)",
          600: "rgba(24, 150, 255, 0.8)",
          700: "rgba(24, 150, 255, 1)",
        },
        "vision-bg": "rgba(17, 8, 49, 1)",
        "vision-card": "rgba(31, 35, 89, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      backgroundImage: {
        'vision-gradient': 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.69) 76.65%)',
        'vision-primary-gradient': 'linear-gradient(90deg, #7551FF 0%, #A163F7 50.52%, #CB9FFF 100%)',
        'vision-blue-gradient': 'linear-gradient(90deg, #0075FF 0%, #56ABFF 50.52%, #94C9FF 100%)',
        'vision-sidebar': 'linear-gradient(120deg, rgba(26, 18, 63, 0.94) 0%, rgba(10, 10, 49, 0.94) 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
