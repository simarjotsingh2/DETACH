export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrls: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  sizes?: string
}

export interface Order {
  id: string
  userId: string
  totalPrice: number
  status: string
  createdAt: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  sizes?: string
  product: Product
}

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export type Category = 'TSHIRTS' | 'HOODIES' | 'ACCESSORIES' | 'PANTS' | 'SHOES'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
