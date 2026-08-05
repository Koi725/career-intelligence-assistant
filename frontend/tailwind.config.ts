import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0e1012",
        header: "#101316",
        panel: "#121518",
        inset: "#0f1214",
        deep: "#0c0f11",
        raised: "#181d22",
        control: "#181c20",
        "control-active": "#232a31",
        hairline: {
          DEFAULT: "#24282c",
          subtle: "#1e2226",
          control: "#262b30",
          strong: "#2c343b",
          dashed: "#333a41",
        },
        fg: {
          DEFAULT: "#e8eaec",
          bright: "#f2f4f5",
          body: "#c3c9ce",
        },
        muted: {
          DEFAULT: "#9aa2a9",
          2: "#8b939a",
          3: "#7c848b",
        },
        faint: {
          DEFAULT: "#6b747b",
          2: "#5f686f",
          3: "#525a61",
        },
        dot: "#33393e",
        accent: {
          DEFAULT: "#5980a6",
          hover: "#6d93b8",
          light: "#8fb2d4",
          lighter: "#b6cfe6",
          quiet: "#3a536e",
          fg: "#0b0e10",
        },
        score: {
          good: "#6cb488",
          mid: "#c3a45f",
          low: "#c98d86",
        },
        good: {
          bg: "#12211a",
          border: "#2f5c42",
        },
        warn: {
          bg: "#161510",
          border: "#3d3524",
          fg: "#a89463",
        },
        error: {
          bg: "#1a1213",
          border: "#4a3330",
          title: "#e0b8b3",
          body: "#a08b88",
          code: "#7d6b69",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "0",
      },
      // Named tokens for off-scale and semantic sizing — no arbitrary value
      // should ever appear in a className.
      width: {
        "tone-bar": "3px",
        "scope-marker": "6px",
        logo: "22px",
        avatar: "24px",
        "remove-btn": "26px",
        "send-button": "34px",
        "citation-kind": "52px",
        cursor: "7px",
      },
      height: {
        "tone-bar": "16px",
        "scope-marker": "6px",
        logo: "22px",
        avatar: "24px",
        "remove-btn": "26px",
        "send-button": "34px",
        topbar: "52px",
        cta: "38px",
        "score-track": "4px",
        cursor: "15px",
      },
      minWidth: {
        logo: "22px",
        avatar: "24px",
        "citation-kind": "52px",
      },
      minHeight: {
        avatar: "24px",
        "send-button": "34px",
      },
      borderWidth: {
        // 2px left rule on expanded citation chunks
        "chunk-rule": "2px",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
