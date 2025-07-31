import { NextRequest, NextResponse } from 'next/server'
import { redisBudgetOps } from '../../../lib/redis'

// GET - Carregar dados do orçamento
export async function GET() {
  try {
    // Primeiro tenta carregar do Redis
    const redisData = await redisBudgetOps.getBudgetData()
    
    if (redisData) {
      console.log('Dados carregados do Redis com sucesso')
      return NextResponse.json(redisData)
    }
    
    // Se não existir no Redis, carrega dados originais e salva no Redis
    console.log('Dados não encontrados no Redis, carregando dados originais...')
    const originalData = await import('../../../lib/budget-data')
    
    // Salva no Redis para próximas consultas
    const saveSuccess = await redisBudgetOps.setBudgetData(originalData.budgetData)
    if (saveSuccess) {
      console.log('Dados originais salvos no Redis com sucesso')
    } else {
      console.log('Aviso: Falha ao salvar dados originais no Redis')
    }
    
    return NextResponse.json(originalData.budgetData)
  } catch (error) {
    console.error('Erro ao carregar dados do orçamento:', error)
    return NextResponse.json({ 
      error: 'Erro ao carregar dados do orçamento',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST - Salvar dados do orçamento
export async function POST(request: NextRequest) {
  try {
    const budgetData = await request.json()
    
    // Salva no Redis
    const saveSuccess = await redisBudgetOps.setBudgetData(budgetData)
    
    if (saveSuccess) {
      console.log('Dados salvos no Redis com sucesso')
      return NextResponse.json({
        success: true,
        message: 'Dados salvos com sucesso no Redis!',
        redis: true
      })
    } else {
      console.error('Falha ao salvar dados no Redis')
      return NextResponse.json({
        success: false,
        error: 'Falha ao salvar dados no Redis'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro ao salvar dados do orçamento:', error)
    return NextResponse.json({
      error: 'Erro ao salvar dados',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// PUT - Reset para dados originais
export async function PUT() {
  try {
    const originalData = await import('../../../lib/budget-data')
    
    // Reseta no Redis
    const resetSuccess = await redisBudgetOps.resetBudgetData(originalData.budgetData)
    
    if (resetSuccess) {
      console.log('Dados resetados no Redis com sucesso')
      return NextResponse.json({ 
        success: true, 
        message: 'Dados resetados para o original no Redis!',
        redis: true
      })
    } else {
      console.error('Falha ao resetar dados no Redis')
      return NextResponse.json({
        success: false,
        error: 'Falha ao resetar dados no Redis'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erro ao resetar dados:', error)
    return NextResponse.json({ 
      error: 'Erro ao resetar dados',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}