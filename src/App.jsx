import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TechStrip from './components/TechStrip'
import FullSolution from './components/FullSolution'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import BookCall from './components/BookCall'
import LeadForm from './components/LeadForm'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'

export default function App() {
  return (
    <div className="min-h-screen bg-[#080818]">
      <Navbar />
      <Hero />
      <TechStrip />
      <FullSolution />
      <Services />
      <WhyUs />
      <BookCall />
      <LeadForm />
      <Footer />
      <ChatWidget />
    </div>
  )
}
