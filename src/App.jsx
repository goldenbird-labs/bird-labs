import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FreeReview from './components/FreeReview'
import Problems from './components/Problems'
import Services from './components/Services'
import Process from './components/Process'
import Work from './components/Work'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MobileCTA from './components/MobileCTA'
import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <FreeReview />
        <Problems />
        <Services />
        <Process />
        <Work />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <MobileCTA />
      <ChatWidget />
    </>
  )
}
