import heroImg from './assets/hero.png'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Card from './components/Card/Card'
import Footer from './components/Footer/Footer'
import './App.css'

function App() {
  const appTitle = 'College Club Builder'

  return (
    <div className="app-shell">
      <Header title={appTitle} />
      <Hero title={appTitle} imageSrc={heroImg} />

      <section className="cards-grid" aria-label="Feature cards">
      </section>

      <Footer title={appTitle} />
    </div>
  )
}

export default App
