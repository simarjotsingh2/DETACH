/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// --- your existing system tokens ---
				primary: {
					'50': '#f8f9fa',
					'100': '#e9ecef',
					'200': '#dee2e6',
					'300': '#ced4da',
					'400': '#adb5bd',
					'500': '#6c757d',
					'600': '#495057',
					'700': '#343a40',
					'800': '#212529',
					'900': '#0d1117',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				accent: {
					'50': '#fff1f2',
					'100': '#ffe4e6',
					'200': '#fecdd3',
					'300': '#fda4af',
					'400': '#fb7185',
					'500': '#f43f5e',
					'600': '#e11d48',
					'700': '#be123c',
					'800': '#9f1239',
					'900': '#881337',
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				dark: '#0a0a0a',
				light: '#fafafa',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},

				// --- extra palettes for neon/spotlight themes ---
				ink: {
					900: '#0a0b0f',
					800: '#0c0f14',
					700: '#11151c',
				},
				neon: {
					pink: '#ff4fd8',
					blue: '#6db7ff',
					violet: '#8b5dff',
				},
			},

			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Orbitron', 'monospace'],
				mono: ['JetBrains Mono', 'monospace'],
			},

			// Cinematic glows + card depth
			boxShadow: {
				glow: '0 0 24px rgba(109,183,255,.35), 0 0 64px rgba(255,79,216,.25)',
				card: '0 6px 40px rgba(0,0,0,.45)',
			},

			// Spotlight/Grain backgrounds
			backgroundImage: {
				noise:
					"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.65' numOctaves='3'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/></svg>\")",
				'radial-spot':
					'radial-gradient(1200px 600px at 20% 10%, rgba(139,93,255,.25), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(109,183,255,.18), transparent 60%), radial-gradient(800px 600px at 50% 100%, rgba(255,79,216,.18), transparent 65%)',
			},

			// --- animations (kept yours + added shimmer/float/glow) ---
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.5s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',

				shimmer: 'shimmer 2.8s linear infinite',
				floaty: 'floaty 4s ease-in-out infinite',
				pulseBorder: 'pulseBorder 2.4s ease-out infinite',
				fadeUp: 'fadeUp .6s ease forwards',
			},
			keyframes: {
				// existing
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},

				// new
				shimmer: {
					'0%': { backgroundPosition: '0% 50%' },
					'100%': { backgroundPosition: '200% 50%' },
				},
				floaty: {
					'0%,100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' },
				},
				pulseBorder: {
					'0%': { boxShadow: '0 0 0 0 rgba(139,93,255,.45)' },
					'70%': { boxShadow: '0 0 0 12px rgba(139,93,255,0)' },
					'100%': { boxShadow: '0 0 0 0 rgba(139,93,255,0)' },
				},
				fadeUp: {
					'0%': { opacity: 0, transform: 'translateY(16px)' },
					'100%': { opacity: 1, transform: 'translateY(0)' },
				},
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
