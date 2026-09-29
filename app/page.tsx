import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Architecture from '@/components/Architecture'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import OpenSource from '@/components/OpenSource'
import Writing from '@/components/Writing'
import Stack from '@/components/Stack'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-[#0a0a0f]">
      <Nav />
      <Hero />
      <Architecture />
      <About />
      <Experience />
      <Projects />
      <OpenSource />
      <Writing />
      <Stack />
      <Contact />
      <Footer />
    </main>
  )
}
