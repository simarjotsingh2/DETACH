// components/FeaturedProducts.tsx
'use client'

import "./FeaturedProducts.css"
import FeaturedProductsEmbla from './FeaturedProductsEmbla'

export default function FeaturedProducts() {
  return (
    <FeaturedProductsEmbla
      fetchUrl="/api/products?featured=true"
      autoplayMs={5000}
    />
  )
}
