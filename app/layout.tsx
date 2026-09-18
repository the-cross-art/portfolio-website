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
  openGraph: {
    title: 'Imran Nazir — AI Applied Engineer',
    description: 'AI Applied Engineer II at QuillBot. I build infrastructure that LLMs run on at scale.',
    url: 'https://meimran.me',
    siteName: 'Imran Nazir',
    type: 'website',
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
