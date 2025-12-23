import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value
    
    if (!token) {
      // Return empty data during static generation when no cookies are available
      return NextResponse.json({
        overview: {
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          monthlyGrowth: 0,
          weeklyOrderGrowth: 0,
          monthlyOrderGrowth: 0,
          monthlyRevenueGrowth: 0,
          monthlyProductGrowth: 0
        },
        recentOrders: [],
        topProducts: [],
        dailyStats: []
      })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const days = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Calculate date ranges for comparisons
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Get analytics data
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      // Weekly comparisons
      ordersThisWeek,
      ordersLastWeek,
      revenueThisWeek,
      revenueLastWeek,
      // Monthly comparisons
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      // Product growth
      productsThisMonth,
      productsLastMonth,
      dailyStats
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        _sum: { totalPrice: true }
      }),
      
      // Recent orders (last 30 days)
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // Orders this week
      prisma.order.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      
      // Orders last week
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: oneWeekAgo
          }
        }
      }),
      
      // Revenue this week
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        },
        _sum: { totalPrice: true }
      }),
      
      // Revenue last week
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: oneWeekAgo
          }
        },
        _sum: { totalPrice: true }
      }),
      
      // Orders this month
      prisma.order.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      }),
      
      // Orders last month
      prisma.order.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo
          }
        }
      }),
      
      // Revenue this month
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        },
        _sum: { totalPrice: true }
      }),
      
      // Revenue last month
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo
          }
        },
        _sum: { totalPrice: true }
      }),
      
      // Products added this month
      prisma.product.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      }),
      
      // Products added last month
      prisma.product.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: oneMonthAgo
          }
        }
      }),
      
      // Daily stats for the period
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          totalPrice: true
        },
        _count: {
          id: true
        }
      })
    ])

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            price: true,
            imageUrls: true
          }
        })
        return {
          ...item,
          product
        }
      })
    )

    // Calculate growth percentages
    const weeklyOrderGrowth = ordersLastWeek > 0 
      ? ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100 
      : ordersThisWeek > 0 ? 100 : 0

    const weeklyRevenueGrowth = (revenueLastWeek._sum.totalPrice || 0) > 0 
      ? (((revenueThisWeek._sum.totalPrice || 0) - (revenueLastWeek._sum.totalPrice || 0)) / (revenueLastWeek._sum.totalPrice || 0)) * 100 
      : (revenueThisWeek._sum.totalPrice || 0) > 0 ? 100 : 0

    const monthlyOrderGrowth = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 
      : ordersThisMonth > 0 ? 100 : 0

    const monthlyRevenueGrowth = (revenueLastMonth._sum.totalPrice || 0) > 0 
      ? (((revenueThisMonth._sum.totalPrice || 0) - (revenueLastMonth._sum.totalPrice || 0)) / (revenueLastMonth._sum.totalPrice || 0)) * 100 
      : (revenueThisMonth._sum.totalPrice || 0) > 0 ? 100 : 0

    const monthlyProductGrowth = productsLastMonth > 0 
      ? ((productsThisMonth - productsLastMonth) / productsLastMonth) * 100 
      : productsThisMonth > 0 ? 100 : 0

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        monthlyGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
        weeklyOrderGrowth: Math.round(weeklyOrderGrowth * 100) / 100,
        monthlyOrderGrowth: Math.round(monthlyOrderGrowth * 100) / 100,
        monthlyRevenueGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
        monthlyProductGrowth: Math.round(monthlyProductGrowth * 100) / 100
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      dailyStats: dailyStats.map(stat => ({
        date: stat.createdAt.toISOString().split('T')[0],
        revenue: stat._sum.totalPrice || 0,
        orders: stat._count.id
      }))
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
