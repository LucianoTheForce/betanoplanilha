import { NextRequest, NextResponse } from 'next/server'

interface BudgetItem {
  id: string
  description: string
  quantity: number
  unitValue: number
  billingType: 'Direto ao Cliente' | 'Faturamento Direto'
}

interface AIEditRequest {
  items: BudgetItem[]
  prompt: string
}

interface AIEditResponse {
  success: boolean
  editedItems?: BudgetItem[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AIEditResponse>> {
  try {
    const body: AIEditRequest = await request.json()
    const { items, prompt } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum item fornecido para edição'
      }, { status: 400 })
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prompt não fornecido'
      }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'Chave da API OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.local'
      }, { status: 500 })
    }

    // Prepare the system message and user prompt
    const systemMessage = `Você é um assistente especializado em edição de planilhas orçamentárias. 
Você receberá uma lista de itens de orçamento e um prompt descrevendo as alterações desejadas.
Retorne APENAS um JSON válido com os itens editados, mantendo a mesma estrutura e IDs.

Estrutura dos itens:
- id: string (NUNCA altere)
- description: string (descrição do item)
- quantity: number (quantidade)
- unitValue: number (valor unitário em reais)
- billingType: "Direto ao Cliente" ou "Faturamento Direto"

IMPORTANTE: 
- Mantenha sempre os mesmos IDs dos itens
- Retorne APENAS o JSON, sem explicações adicionais
- Se não conseguir processar algum item, mantenha-o inalterado
- Valores monetários devem ser números (sem símbolos de moeda)
- Seja preciso e cuidadoso com os cálculos`

    const userMessage = `Itens para editar:
${JSON.stringify(items, null, 2)}

Prompt de edição: ${prompt}

Retorne os itens editados em formato JSON:`

    // Make the OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the more cost-effective model
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1, // Low temperature for more consistent results
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json({
        success: false,
        error: `Erro na API OpenAI: ${response.status} ${response.statusText}`
      }, { status: 500 })
    }

    const openaiResponse = await response.json()
    
    if (!openaiResponse.choices || openaiResponse.choices.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Resposta inválida da API OpenAI'
      }, { status: 500 })
    }

    const aiContent = openaiResponse.choices[0].message?.content?.trim()
    if (!aiContent) {
      return NextResponse.json({
        success: false,
        error: 'Resposta vazia da IA'
      }, { status: 500 })
    }

    // Try to parse the AI response as JSON
    let editedItems: BudgetItem[]
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      editedItems = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent)
      return NextResponse.json({
        success: false,
        error: 'Resposta da IA não está em formato JSON válido'
      }, { status: 500 })
    }

    // Validate the edited items
    if (!Array.isArray(editedItems)) {
      return NextResponse.json({
        success: false,
        error: 'Resposta da IA não é um array válido'
      }, { status: 500 })
    }

    // Ensure all original IDs are preserved and validate structure
    const validatedItems: BudgetItem[] = []
    for (const originalItem of items) {
      const editedItem = editedItems.find(item => item.id === originalItem.id)
      
      if (editedItem) {
        // Validate and sanitize the edited item
        const validatedItem: BudgetItem = {
          id: originalItem.id, // Always preserve original ID
          description: typeof editedItem.description === 'string' ? editedItem.description : originalItem.description,
          quantity: typeof editedItem.quantity === 'number' && editedItem.quantity > 0 ? editedItem.quantity : originalItem.quantity,
          unitValue: typeof editedItem.unitValue === 'number' && editedItem.unitValue > 0 ? editedItem.unitValue : originalItem.unitValue,
          billingType: (editedItem.billingType === 'Direto ao Cliente' || editedItem.billingType === 'Faturamento Direto') 
            ? editedItem.billingType 
            : originalItem.billingType
        }
        validatedItems.push(validatedItem)
      } else {
        // If AI didn't return this item, keep original
        validatedItems.push(originalItem)
      }
    }

    return NextResponse.json({
      success: true,
      editedItems: validatedItems
    })

  } catch (error) {
    console.error('AI Edit API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}