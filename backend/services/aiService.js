const { ENV } = require('../config/env')
const { APP_CONSTANTS } = require('../config/constants')

class AiService {

  async reviewSolution(payload = {}) {
    const {
      problemTitle = 'DSA Problem',
      patternTitle = 'General DSA',
      difficulty = 'Medium',
      code = '',
      language = 'Language',
    } = payload

    if (!code || !code.trim()) {
      const err = new Error('Code snippet is required for AI review')
      err.statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST
      throw err
    }

    const systemPrompt = `You are a Senior Staff Software Engineer and Technical Interviewer at Google/Meta.
Analyze the following student's DSA solution code for "${problemTitle}" (Category: ${patternTitle}, Difficulty: ${difficulty}).

Evaluate the code rigorously:
1. Exact Time Complexity with concise proof.
2. Exact Space Complexity with auxiliary memory breakdown.
3. Problem-Aware Optimality: If this is a Matrix or Graph or 2D DP problem, recognize that O(N*M) or O(V+E) and O(V) space is the theoretical lower bound.
4. Edge Cases: Identify whether it handles empty input, single element, negative numbers, overflow, or boundary conditions.
5. Interviewer Verdict: Score from 1.0 to 10.0, clean code feedback, variable naming, and early returns.
6. Optimal Trick / Follow-up: If a cleaner or faster approach exists, give a 2-line explanation.

You MUST respond strictly in valid JSON format matching this schema:
{
  "score": 9.5,
  "isOptimal": true,
  "optimalityTag": "Optimal Bound (In-place)",
  "timeComplexity": "O(N^2)",
  "timeProof": "Brief proof",
  "spaceComplexity": "O(1)",
  "spaceProof": "Brief proof",
  "edgeCases": [
    { "name": "1x1 Matrix", "status": "Passed", "note": "Handled naturally" }
  ],
  "interviewerTips": "Tips for interview",
  "betterApproach": "Alternative approach if any, or null"
}`

    const userPrompt = `Code (${language}):\n\`\`\`${language}\n${code}\n\`\`\``

    const activeModel = (ENV.AI_MODEL || 'GEMINI').toUpperCase()
    console.log(`[AI Service] Reviewing with primary model: ${activeModel}`)

    // Provider priority order based on AI_MODEL setting
    const providers = []
    if (ENV.CUSTOM_MODEL_URL) providers.push('CUSTOM_MODEL')
    if (activeModel.includes('OLLAMA')) providers.push('OLLAMA')
    else if (activeModel.includes('GROQ')) providers.push('GROQ')
    else if (activeModel.includes('GROK')) providers.push('GROK')
    else if (activeModel.includes('OPENAI')) providers.push('OPENAI')
    else providers.push('GEMINI')

    // Append fallback providers in sensible order
    const all = ['CUSTOM_MODEL', 'OLLAMA', 'GEMINI', 'GROQ', 'OPENAI', 'GROK']
    for (const p of all) {
      if (!providers.includes(p)) providers.push(p)
    }

    let lastError = null

    for (const provider of providers) {
      try {
        if (provider === 'CUSTOM_MODEL' && ENV.CUSTOM_MODEL_URL) {
          if (ENV.CUSTOM_MODEL_URL.includes('11434')) {
            return await this.callOllama(systemPrompt, userPrompt)
          }
          return await this.callCustomCloudModel(payload, systemPrompt, userPrompt)
        }
        if (provider === 'OLLAMA') {
          return await this.callOllama(systemPrompt, userPrompt)
        }
        if (provider === 'GEMINI' && ENV.GEMINI_API_KEY) {
          return await this.callGemini(systemPrompt, userPrompt)
        }
        if (provider === 'GROQ' && ENV.GROQ_API_KEY) {
          return await this.callGroq(systemPrompt, userPrompt)
        }
        if (provider === 'OPENAI' && ENV.OPENAI_API) {
          return await this.callOpenAI(systemPrompt, userPrompt)
        }
        if (provider === 'GROK' && ENV.GROK_API_KEY) {
          return await this.callGrok(systemPrompt, userPrompt)
        }
      } catch (err) {
        console.warn(`[AI Service] Provider ${provider} failed: ${err.message}. Trying next fallback...`)
        lastError = err
      }
    }

    throw new Error(
      lastError
        ? `All AI providers failed: ${lastError.message}`
        : 'No AI API keys configured. Please set GEMINI_API_KEY or GROQ_API_KEY in .env'
    )
  }

  async callGemini(systemPrompt, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    try {
      const parsed = JSON.parse(rawText)
      return {
        provider: 'Google Gemini 2.5 Flash',
        ...parsed,
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', rawText)
      throw new Error('AI returned non-JSON format')
    }
  }

  async callGroq(systemPrompt, userPrompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Groq API error: ${response.status} - ${errText}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    return {
      provider: 'Groq (Llama 3.3 70B)',
      ...parsed,
    }
  }

  async callOpenAI(systemPrompt, userPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.OPENAI_API}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    return {
      provider: 'OpenAI GPT-4o-mini',
      ...parsed,
    }
  }

  async callGrok(systemPrompt, userPrompt) {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Grok (xAI) API error: ${response.status} - ${errText}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
    return {
      provider: 'xAI Grok-2',
      ...parsed,
    }
  }

  async callOllama(systemPrompt, userPrompt) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const baseUrl = (ENV.OLLAMA_URL || (ENV.CUSTOM_MODEL_URL?.includes('11434') ? ENV.CUSTOM_MODEL_URL : null) || 'http://127.0.0.1:11434').replace(/\/$/, '')
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen2.5-coder:1.5b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          format: 'json',
          stream: false,
          options: {
            temperature: 0.2,
            num_predict: 800,
          },
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Ollama error: ${response.status} - ${errText}`)
      }

      const data = await response.json()
      let rawText = (data.message?.content || '{}').trim()
      if (rawText.includes('```json')) {
        rawText = rawText.split('```json')[1].split('```')[0].trim()
      } else if (rawText.includes('```')) {
        rawText = rawText.split('```')[1].split('```')[0].trim()
      }

      const parsed = JSON.parse(rawText)
      return {
        provider: 'Local GPU Model (Qwen 2.5 Coder 1.5B • Offline)',
        ...parsed,
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  async callCustomCloudModel(payload) {
    let baseUrl = ENV.CUSTOM_MODEL_URL.replace(/\/$/, '')
    if (!baseUrl.endsWith('/api/review')) {
      baseUrl = `${baseUrl}/api/review`
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Custom Cloud Model HTTP ${response.status}: ${errText}`)
      }

      const data = await response.json()
      return data
    } finally {
      clearTimeout(timeout)
    }
  }
}

module.exports = new AiService()
