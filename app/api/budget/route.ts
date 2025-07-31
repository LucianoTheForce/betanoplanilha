import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const budgetFilePath = path.join(process.cwd(), 'data', 'budget-editable.json')

// GET - Carregar dados do orçamento
export async function GET() {
  try {
    // Tenta ler o arquivo editado
    try {
      const data = await fs.readFile(budgetFilePath, 'utf8')
      return NextResponse.json(JSON.parse(data))
    } catch (error) {
      // Se não existe, cria a partir dos dados originais
      const originalDataPath = path.join(process.cwd(), 'lib', 'budget-data.ts')
      const originalData = await import('../../lib/budget-data')
      
      // Cria diretório se não existir
      const dataDir = path.dirname(budgetFilePath)
      try {
        await fs.access(dataDir)
      } catch {
        await fs.mkdir(dataDir, { recursive: true })
      }
      
      // Salva dados originais como base
      await fs.writeFile(budgetFilePath, JSON.stringify(originalData.budgetData, null, 2))
      return NextResponse.json(originalData.budgetData)
    }
  } catch (error) {
    console.error('Erro ao carregar dados do orçamento:', error)
    return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 })
  }
}

// POST - Salvar dados do orçamento
export async function POST(request: NextRequest) {
  try {
    const budgetData = await request.json()
    
    // Cria diretório se não existir
    const dataDir = path.dirname(budgetFilePath)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Salva os dados
    await fs.writeFile(budgetFilePath, JSON.stringify(budgetData, null, 2))
    
    return NextResponse.json({ success: true, message: 'Dados salvos com sucesso!' })
  } catch (error) {
    console.error('Erro ao salvar dados do orçamento:', error)
    return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 })
  }
}

// PUT - Reset para dados originais
export async function PUT() {
  try {
    const originalData = await import('../../lib/budget-data')
    
    // Cria diretório se não existir
    const dataDir = path.dirname(budgetFilePath)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    await fs.writeFile(budgetFilePath, JSON.stringify(originalData.budgetData, null, 2))
    
    return NextResponse.json({ success: true, message: 'Dados resetados para o original!' })
  } catch (error) {
    console.error('Erro ao resetar dados:', error)
    return NextResponse.json({ error: 'Erro ao resetar dados' }, { status: 500 })
  }
}