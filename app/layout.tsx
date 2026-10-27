import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Imran Nazir — AI Applied Engineer',
  description:
    'AI Applied Engineer II at QuillBot. I build the infrastructure that serves LLMs at scale. Writing about GPU inference, Kubernetes, and ML systems.',
  keywords: ['MLOps', 'LLM Serving', 'Kubernetes', 'vLLM', 'GPU Inference', 'ML Infrastructure'],
  authors: [{ name: 'Imran Nazir' }],
  /* The live site. meimran.me is registered but has no DNS at all — the .ME
     registry returns NXDOMAIN — so pointing metadata at it meant every link
     preview resolved og:image to a host that does not exist, and WhatsApp,
     Slack and LinkedIn all fell back to a bare link. Flip both of these back
     once the domain is delegated to Netlify. */
  metadataBase: new URL('https://meimran.netlify.app'),
  openGraph: {
    title: 'Imran Nazir — AI Applied Engineer',
    description: 'AI Applied Engineer II at QuillBot. I build the infrastructure that LLMs run on at scale.',
    url: 'https://meimran.netlify.app',
    siteName: 'Imran Nazir',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Imran Nazir — AI Applied Engineer II at QuillBot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imran Nazir — AI Applied Engineer',
    description: 'AI Applied Engineer II at QuillBot. I build the infrastructure that LLMs run on at scale.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash: set dark class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
