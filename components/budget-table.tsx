"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { budgetData } from '@/lib/budget-data'
import { motion, AnimatePresence } from 'framer-motion'

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
}

interface BudgetCategory {
  id: string
  name: string
  description: string
  items: BudgetItem[]
}

export function BudgetTable() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calculateItemTotal = (item: BudgetItem) => {
    return item.quantity * item.days * item.frequency * item.unitPrice
  }

  const calculateCategoryTotal = (category: BudgetCategory) => {
    return category.items.reduce((total, item) => {
      if (item.status) {
        return total + calculateItemTotal(item)
      }
      return total
    }, 0)
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-white">{budgetData.title}</h2>
        <p className="text-white/60">{budgetData.description}</p>
      </div>

      <div className="space-y-4">
        {budgetData.categories.map((category) => (
          <div key={category.id} className="border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-5 h-5 text-white" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-white">{category.name}</h3>
                  <p className="text-sm text-white/60">{category.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-white">{formatCurrency(calculateCategoryTotal(category))}</p>
                <p className="text-sm text-white/60">{category.items.length} itens</p>
              </div>
            </button>

            <AnimatePresence>
              {expandedCategories.includes(category.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-black/50">
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div key={item.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-white">{item.description}</h4>
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className="text-white/60 hover:text-white transition-colors"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <AnimatePresence>
                                {expandedItems.includes(item.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2 text-sm text-white/60"
                                  >
                                    {item.detailedDescription}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-white/80">
                                <div>
                                  <span className="text-white/60">Qtd:</span> {item.quantity}
                                </div>
                                <div>
                                  <span className="text-white/60">Dias:</span> {item.days}
                                </div>
                                <div>
                                  <span className="text-white/60">Frequência:</span> {item.frequency}x
                                </div>
                                <div>
                                  <span className="text-white/60">Unitário:</span> {formatCurrency(item.unitPrice)}
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-primary/10 rounded">
                                  {item.supplier}
                                </span>
                                <span className="px-2 py-1 bg-secondary/10 rounded">
                                  {item.billingType}
                                </span>
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <p className="font-semibold text-white">{formatCurrency(calculateItemTotal(item))}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-white/10 rounded-lg border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-white">Resumo do Orçamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-white/60">Direto ao Cliente</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.direto / 100)}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-white/60">The Force (Bi Tributado)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.biTributado / 100)}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-white/60">Equipe</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.equipe / 100)}</p>
          </div>
          <div className="bg-white/20 text-white p-4 rounded-lg border border-white/30">
            <p className="text-sm">Total Geral</p>
            <p className="text-2xl font-bold">{formatCurrency(budgetData.totals.geral / 100)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}