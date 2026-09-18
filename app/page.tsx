import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Writing from '@/components/Writing'
import Stack from '@/components/Stack'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] dark:bg-[#0a0a0f]">
      <Nav />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Writing />
      <Stack />
      <Contact />
      <Footer />
    </main>
  )
}
