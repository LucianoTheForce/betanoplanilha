"use client"

import React from 'react'
import { budgetData } from '@/lib/budget-data'

export function BudgetTable() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calculateItemTotal = (item: any) => {
    return item.quantity * item.days * item.frequency * item.unitPrice
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Item</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Descrição</th>
              <th className="text-center py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Qtd</th>
              <th className="text-center py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Dias</th>
              <th className="text-center py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Freq</th>
              <th className="text-right py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Unitário</th>
              <th className="text-right py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Total</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.categories.map((category) => (
              <React.Fragment key={category.id}>
                <tr className="bg-white/5">
                  <td colSpan={8} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{category.name}</span>
                      <span className="text-sm text-white/60">({category.description})</span>
                    </div>
                  </td>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-white/80">{item.id}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-white">{item.description}</div>
                      <div className="text-xs text-white/60 mt-1">{item.supplier}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-white/80">{item.quantity}</td>
                    <td className="py-3 px-4 text-center text-sm text-white/80">{item.days}</td>
                    <td className="py-3 px-4 text-center text-sm text-white/80">{item.frequency}x</td>
                    <td className="py-3 px-4 text-right text-sm text-white/80">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-white">
                      {formatCurrency(calculateItemTotal(item))}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`
                        px-2 py-1 rounded text-xs
                        ${item.billingType === 'Direto ao Cliente' ? 'bg-green-500/20 text-green-400' : ''}
                        ${item.billingType === 'The Force (Bi Tributado)' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${item.billingType === 'Equipe' ? 'bg-purple-500/20 text-purple-400' : ''}
                      `}>
                        {item.billingType}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-white/10">
                  <td colSpan={6} className="py-3 px-4 text-right font-medium text-white">
                    Subtotal {category.name}:
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {formatCurrency(category.items.reduce((total, item) => total + calculateItemTotal(item), 0))}
                  </td>
                  <td></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-white/20">
              <td colSpan={8} className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-400 mb-1">Direto ao Cliente</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.direto / 100)}</p>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-400 mb-1">The Force (Bi Tributado)</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.biTributado / 100)}</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-purple-400 mb-1">Equipe</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.equipe / 100)}</p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg border border-white/30">
                    <p className="text-sm text-white mb-1">TOTAL GERAL</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(budgetData.totals.geral / 100)}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Observações Importantes</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>• Valores baseados em 40 dias úteis de operação na Estação Sé do Metrô</li>
          <li>• Operação diária de 6 horas (horário de pico)</li>
          <li>• Equipe de 11 profissionais dedicados</li>
          <li>• Todos os valores incluem impostos e encargos aplicáveis</li>
          <li>• Proposta válida por 30 dias a partir da data de apresentação</li>
        </ul>
      </div>
    </div>
  )
}