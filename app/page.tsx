import CategoriesSection from '@/components/CategoriesSection'
import FeaturedProducts from '@/components/FeaturedProducts'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import Navigation from '@/components/Navigation'


export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <Footer />
    </main>
  )
}
