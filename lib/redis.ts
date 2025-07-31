import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis keys for our application
export const REDIS_KEYS = {
  BUDGET_DATA: 'budget:data',
  BUDGET_BACKUP: 'budget:backup',
} as const

// TypeScript interfaces for budget data
interface BudgetItem {
  id: string
  description: string
  detailedDescription: string
  status: boolean
  quantity: number
  days: number
  frequency: number
  unitPrice: number
  supplier: string
  invoice: string
  billingType: string
  notes?: string
}

interface BudgetCategory {
  id: string
  name: string
  description: string
  items: BudgetItem[]
}

interface BudgetData {
  title: string
  description: string
  categories: BudgetCategory[]
  totals: {
    direto: number
    faturamentoDireto: number
    equipe: number
    geral: number
  }
  summary: {
    totalItems: number
    totalCategories: number
    activeItems: number
    currency: string
    lastUpdated: string
  }
}

// Helper functions for budget data operations
export const redisBudgetOps = {
  // Get budget data from Redis
  async getBudgetData(): Promise<BudgetData | null> {
    try {
      const data = await redis.get(REDIS_KEYS.BUDGET_DATA)
      if (data && typeof data === 'string') {
        return JSON.parse(data) as BudgetData
      }
      return data as BudgetData | null
    } catch (error) {
      console.error('Error getting budget data from Redis:', error)
      return null
    }
  },

  // Save budget data to Redis
  async setBudgetData(data: BudgetData): Promise<boolean> {
    try {
      // Save current data
      await redis.set(REDIS_KEYS.BUDGET_DATA, JSON.stringify(data))
      
      // Create backup with timestamp
      const backup = {
        data,
        timestamp: new Date().toISOString(),
      }
      await redis.set(REDIS_KEYS.BUDGET_BACKUP, JSON.stringify(backup))
      
      return true
    } catch (error) {
      console.error('Error saving budget data to Redis:', error)
      return false
    }
  },

  // Reset budget data (for development/testing)
  async resetBudgetData(originalData: BudgetData): Promise<boolean> {
    try {
      await redis.set(REDIS_KEYS.BUDGET_DATA, JSON.stringify(originalData))
      return true
    } catch (error) {
      console.error('Error resetting budget data in Redis:', error)
      return false
    }
  },

  // Check Redis connection
  async ping() {
    try {
      const result = await redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis ping failed:', error)
      return false
    }
  }
}