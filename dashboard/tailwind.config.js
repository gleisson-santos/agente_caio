/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        background:  "var(--background)",
        "bg-secondary": "var(--background-secondary)",
        foreground:  "var(--foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        border:      "var(--border)",
        "border-hover": "var(--border-hover)",
        primary: {
          DEFAULT:    "var(--primary)",
          hover:      "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
          soft:       "var(--primary-soft)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          soft:       "var(--accent-soft)",
        },
        sidebar: {
          DEFAULT:    "var(--sidebar-bg)",
          foreground: "var(--sidebar-foreground)",
          active:     "var(--sidebar-active)",
          "active-text": "var(--sidebar-active-text)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        success:     "var(--success)",
        warning:     "var(--warning)",
        destructive: "var(--destructive)",
        info:        "var(--info)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
    },
  },
  plugins: [],
}
