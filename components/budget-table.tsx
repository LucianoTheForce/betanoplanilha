"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { budgetData as defaultBudgetData } from '@/lib/budget-data'
import { ChevronDown, ChevronRight, Edit3, Eye, Save, RefreshCw, AlertCircle, Lock } from 'lucide-react'

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

export function BudgetTable() {
  const [editMode, setEditMode] = useState(false) // Começa em modo cliente (somente leitura)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [editableData, setEditableData] = useState<BudgetData>(defaultBudgetData)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadBudgetData()
  }, [])

  // Adicionar listener para Ctrl+E
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault()
      if (!editMode) {
        setShowPasswordModal(true)
      }
    }
  }, [editMode])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handlePasswordSubmit = () => {
    if (password === '7299') {
      setEditMode(true)
      setShowPasswordModal(false)
      setPassword('')
      setPasswordError('')
    } else {
      setPasswordError('Senha incorreta. Tente novamente.')
      setPassword('')
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit()
    }
  }

  const exitEditMode = () => {
    setEditMode(false)
  }

  const loadBudgetData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/budget')
      if (response.ok) {
        const data = await response.json()
        setEditableData(data)
      } else {
        console.error('Erro ao carregar dados')
        setEditableData(defaultBudgetData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setEditableData(defaultBudgetData)
    } finally {
      setLoading(false)
    }
  }

  const saveBudgetData = async () => {
    try {
      setSaving(true)
      setSaveStatus('idle')
      
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableData)
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    } finally {
      setSaving(false)
    }
  }

  const resetToOriginal = async () => {
    if (confirm('Tem certeza que deseja resetar todos os dados para os valores originais? Esta ação não pode ser desfeita.')) {
      try {
        setSaving(true)
        const response = await fetch('/api/budget', {
          method: 'PUT'
        })

        if (response.ok) {
          await loadBudgetData()
          setSaveStatus('success')
          setTimeout(() => setSaveStatus('idle'), 3000)
        } else {
          setSaveStatus('error')
          setTimeout(() => setSaveStatus('idle'), 5000)
        }
      } catch (error) {
        console.error('Erro ao resetar dados:', error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 5000)
      } finally {
        setSaving(false)
      }
    }
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

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const updateItem = (categoryId: string, itemId: string, field: keyof BudgetItem, value: string | number | boolean) => {
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

  const updateCategory = (categoryId: string, field: keyof BudgetCategory, value: string) => {
    setEditableData(prevData => ({
      ...prevData,
      categories: prevData.categories.map(category => {
        if (category.id === categoryId) {
          return { ...category, [field]: value }
        }
        return category
      })
    }))
  }

  const recalculateTotals = () => {
    let principal = 0
    let equipe = 0

    editableData.categories.forEach(category => {
      category.items.forEach(item => {
        const total = calculateItemTotal(item)
        if (item.billingType === 'Direto ao Cliente' || item.billingType === 'Faturamento Direto') {
          principal += total
        } else if (item.billingType === 'Equipe') {
          equipe += total
        }
      })
    })

    return {
      principal: principal * 100,
      equipe: equipe * 100,
      geral: (principal + equipe) * 100
    }
  }

  const totals = recalculateTotals()

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando dados do orçamento...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold text-white mb-4">Acesso ao Modo de Edição</h3>
            <p className="text-sm text-white/60 mb-4">Digite a senha para acessar o modo de edição:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyDown}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50 mb-4"
              placeholder="Digite a senha"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-4">{passwordError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
                  setPasswordError('')
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400 text-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white">
            {editMode ? 'Modo de Edição' : 'Modo Cliente'}
          </h3>
          {saveStatus === 'success' && (
            <div className="text-green-400 text-sm flex items-center gap-1">
              ✓ Dados salvos com sucesso!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Erro ao salvar dados
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Lock className="w-4 h-4" />
              <span>Pressione Ctrl+E para editar</span>
            </div>
          ) : (
            <>
              <button
                onClick={exitEditMode}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Modo Cliente
              </button>
              <button
                onClick={saveBudgetData}
                disabled={saving}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={resetToOriginal}
                disabled={saving}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </>
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
                <th className="text-left py-4 px-4 text-sm font-medium text-white/60 uppercase tracking-wider">Observações</th>
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
                    <td colSpan={10} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {editMode ? (
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                            className="text-lg font-bold bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">{category.name}</span>
                        )}
                        {editMode ? (
                          <input
                            type="text"
                            value={category.description}
                            onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                            className="text-sm bg-white/10 border border-white/20 rounded px-2 py-1 text-white/90"
                            placeholder="Descrição da categoria"
                          />
                        ) : (
                          <span className="text-sm text-white/60">({category.description})</span>
                        )}
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
                          <div className="text-xs text-white/60 mt-1">
                            {editMode ? (
                              <input
                                type="text"
                                value={item.supplier}
                                onChange={(e) => updateItem(category.id, item.id, 'supplier', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded px-1 text-xs text-white/80"
                                placeholder="Fornecedor"
                              />
                            ) : (
                              item.supplier
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {editMode ? (
                            <textarea
                              value={item.notes || ''}
                              onChange={(e) => updateItem(category.id, item.id, 'notes', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white resize-none"
                              placeholder="Observações adicionais"
                              rows={2}
                            />
                          ) : (
                            <div className="text-sm text-white/80">{item.notes || '-'}</div>
                          )}
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
                            ${item.billingType === 'Direto ao Cliente' || item.billingType === 'Faturamento Direto' ? 'bg-blue-500/20 text-blue-400' : ''}
                            ${item.billingType === 'Equipe' ? 'bg-purple-500/20 text-purple-400' : ''}
                          `}>
                            {item.billingType}
                          </span>
                        </td>
                      </tr>
                      {expandedItems.includes(item.id) && (
                        <tr className="bg-black/30">
                          <td colSpan={10} className="p-4">
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
                    <td colSpan={8} className="py-3 px-4 text-right font-medium text-white">
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
                <td colSpan={10} className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
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
            <li className="text-yellow-400">• Modo de edição ativo - Clique em &quot;Modo Cliente&quot; antes de enviar ao cliente</li>
          )}
        </ul>
      </div>
    </div>
  )
}