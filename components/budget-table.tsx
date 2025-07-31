"use client"

import React, { useState, useEffect } from 'react'
import { budgetData } from '@/lib/budget-data'
import { ChevronDown, ChevronRight, Edit3, Eye, Save } from 'lucide-react'

export function BudgetTable() {
  const [editMode, setEditMode] = useState(true) // Começa em modo de edição
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [editableData, setEditableData] = useState(budgetData)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calculateItemTotal = (item: any) => {
    return item.quantity * item.days * item.frequency * item.unitPrice
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const updateItem = (categoryId: string, itemId: string, field: string, value: any) => {
    setEditableData(prevData => ({
      ...prevData,
      categories: prevData.categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: category.items.map(item => {
              if (item.id === itemId) {
                return { ...item, [field]: value }
              }
              return item
            })
          }
        }
        return category
      })
    }))
  }

  const recalculateTotals = () => {
    let direto = 0
    let biTributado = 0
    let equipe = 0

    editableData.categories.forEach(category => {
      category.items.forEach(item => {
        const total = calculateItemTotal(item)
        if (item.billingType === 'Direto ao Cliente') direto += total
        else if (item.billingType === 'The Force (Bi Tributado)') biTributado += total
        else if (item.billingType === 'Equipe') equipe += total
      })
    })

    return {
      direto: direto * 100,
      biTributado: biTributado * 100,
      equipe: equipe * 100,
      geral: (direto + biTributado + equipe) * 100
    }
  }

  const totals = recalculateTotals()

  const saveToLocalStorage = () => {
    localStorage.setItem('budgetData', JSON.stringify(editableData))
    alert('Dados salvos localmente!')
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {editMode ? 'Modo de Edição' : 'Modo de Visualização'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
          >
            {editMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editMode ? 'Visualizar' : 'Editar'}
          </button>
          {editMode && (
            <button
              onClick={saveToLocalStorage}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider w-16"></th>
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
              {editableData.categories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="bg-white/5">
                    <td colSpan={9} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{category.name}</span>
                        <span className="text-sm text-white/60">({category.description})</span>
                      </div>
                    </td>
                  </tr>
                  {category.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleItemExpansion(item.id)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            {expandedItems.includes(item.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/80">{item.id}</td>
                        <td className="py-3 px-4">
                          {editMode ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(category.id, item.id, 'description', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                            />
                          ) : (
                            <div className="text-sm text-white">{item.description}</div>
                          )}
                          <div className="text-xs text-white/60 mt-1">{item.supplier}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(category.id, item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center"
                            />
                          ) : (
                            <span className="text-sm text-white/80">{item.quantity}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              value={item.days}
                              onChange={(e) => updateItem(category.id, item.id, 'days', parseInt(e.target.value) || 0)}
                              className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center"
                            />
                          ) : (
                            <span className="text-sm text-white/80">{item.days}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              value={item.frequency}
                              onChange={(e) => updateItem(category.id, item.id, 'frequency', parseInt(e.target.value) || 0)}
                              className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center"
                            />
                          ) : (
                            <span className="text-sm text-white/80">{item.frequency}x</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editMode ? (
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(category.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-right"
                            />
                          ) : (
                            <span className="text-sm text-white/80">{formatCurrency(item.unitPrice)}</span>
                          )}
                        </td>
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
                      {expandedItems.includes(item.id) && (
                        <tr className="bg-black/30">
                          <td colSpan={9} className="p-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white mb-2">Descrição Detalhada:</div>
                              {editMode ? (
                                <textarea
                                  value={item.detailedDescription}
                                  onChange={(e) => updateItem(category.id, item.id, 'detailedDescription', e.target.value)}
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white/90 min-h-[100px]"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-sm text-white/80 pl-4">{item.detailedDescription}</p>
                              )}
                              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-white/60">Fornecedor:</span>
                                  {editMode ? (
                                    <input
                                      type="text"
                                      value={item.supplier}
                                      onChange={(e) => updateItem(category.id, item.id, 'supplier', e.target.value)}
                                      className="ml-2 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                                    />
                                  ) : (
                                    <span className="ml-2 text-white">{item.supplier}</span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-white/60">Status:</span>
                                  <span className="ml-2 text-white">{item.status ? 'Ativo' : 'Inativo'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  <tr className="bg-white/10">
                    <td colSpan={7} className="py-3 px-4 text-right font-medium text-white">
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
                <td colSpan={9} className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                      <p className="text-sm text-green-400 mb-1">Direto ao Cliente</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totals.direto / 100)}</p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-blue-400 mb-1">The Force (Bi Tributado)</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totals.biTributado / 100)}</p>
                    </div>
                    <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-400 mb-1">Equipe</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totals.equipe / 100)}</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg border border-white/30">
                      <p className="text-sm text-white mb-1">TOTAL GERAL</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totals.geral / 100)}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Observações Importantes</h3>
        <ul className="space-y-2 text-sm text-white/80">
          <li>• Valores baseados em 40 dias úteis de operação na Estação Sé do Metrô</li>
          <li>• Operação diária de 6 horas (horário de pico)</li>
          <li>• Equipe de 11 profissionais dedicados</li>
          <li>• Todos os valores incluem impostos e encargos aplicáveis</li>
          <li>• Proposta válida por 30 dias a partir da data de apresentação</li>
          {editMode && (
            <li className="text-yellow-400">• Modo de edição ativo - Clique em "Visualizar" antes de enviar ao cliente</li>
          )}
        </ul>
      </div>
    </div>
  )
}