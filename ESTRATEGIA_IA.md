# 🤖 Estratégia de IA: Gemini (Desenvolvimento) + GPT (Produção)

## 📋 Visão Geral

Seu projeto usará uma **estratégia dual de IA**:
- **Desenvolvimento/Testes**: Google Gemini (gratuito, ilimitado)
- **Produção**: OpenAI GPT-4 (API paga, mais confiável)

Isso permite:
- ✅ Desenvolver sem custos durante testes
- ✅ Usar o melhor modelo em produção
- ✅ Flexibilidade para mudar

---

## 🎯 Por que cada uma?

### **Google Gemini (Desenvolvimento)**
```
✅ Vantagens:
  - Gratuito e ilimitado
  - Rápido para prototipagem
  - Bom para testes de conceito
  - Sem necessidade de cartão de crédito

❌ Limitações:
  - Menos confiável que GPT-4
  - Respostas menos consistentes
  - Limite de taxa (rate limiting)
  - Não ideal para produção estável
```

### **OpenAI GPT-4 (Produção)**
```
✅ Vantagens:
  - Melhor qualidade de resposta
  - Mais consistente e confiável
  - Melhor compreensão de contexto
  - Ideal para saúde mental (respostas empáticas)

❌ Limitações:
  - Custa dinheiro ($0.03-0.06 por 1K tokens)
  - Limite de taxa mesmo com plano
  - Requer API key segura
```

---

## 💰 Estimativa de Custos (GPT-4)

### **Cenário 1: Usuário Casual**
- 2-3 chats/dia × 20 mensagens × 100 tokens/msg
- ~600 tokens/dia = ~$0.02/dia
- **R$0.10/mês** (praticamente grátis)

### **Cenário 2: 1000 Usuários Ativos**
- 1000 × 3 chats × 20 msgs × 100 tokens
- ~600k tokens/dia = ~$20/dia
- **~$600/mês**

### **Cenário 3: 10000 Usuários Ativos**
- ~6M tokens/dia = ~$200/dia
- **~$6000/mês**

**Solução otimizada:**
- Cache de respostas comuns
- Rate limiting por usuário
- Combinar Gemini (testes) + GPT (crítico)

---

## 🏗️ Arquitetura de Implementação

### **Backend Service Abstrato**

```javascript
// src/services/AIService.js

class AIService {
  constructor() {
    this.geminiClient = this.initGemini();
    this.openaiClient = this.initOpenAI();
  }

  initGemini() {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  initOpenAI() {
    const OpenAI = require("openai");
    return new OpenAI(process.env.OPENAI_API_KEY);
  }

  /**
   * Método principal - decide qual IA usar
   */
  async generateResponse(userId, userMessage, context) {
    try {
      // Em desenvolvimento/teste: use Gemini (gratuito)
      if (process.env.NODE_ENV === "development" || process.env.USE_GEMINI === "true") {
        return await this.callGemini(userMessage, context);
      }

      // Em produção: use GPT-4
      if (process.env.NODE_ENV === "production") {
        return await this.callGPT(userMessage, context);
      }

      // Fallback para Gemini se GPT falhar
      return await this.callGemini(userMessage, context);
    } catch (error) {
      console.error("AI Service Error:", error);
      // Fallback para resposta genérica
      return this.getFallbackResponse();
    }
  }

  /**
   * Chamada para GEMINI (Dev)
   */
  async callGemini(userMessage, context) {
    try {
      const model = this.geminiClient.getGenerativeModel({
        model: "gemini-1.5-flash" // ou "gemini-pro"
      });

      const systemPrompt = this.buildTherapistPrompt(context);

      const chat = model.startChat({
        history: context.history || [],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response.text();

      // Detectar risco
      const riskAnalysis = await this.analyzeRisk(response);

      return {
        message: response,
        model: "gemini",
        riskDetected: riskAnalysis.risk_detected,
        riskScore: riskAnalysis.risk_score,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  /**
   * Chamada para GPT-4 (Prod)
   */
  async callGPT(userMessage, context) {
    try {
      const systemPrompt = this.buildTherapistPrompt(context);

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4", // ou "gpt-3.5-turbo" (mais barato)
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...(context.history || []),
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const reply = response.choices[0].message.content;

      // Detectar risco
      const riskAnalysis = await this.analyzeRisk(reply);

      return {
        message: reply,
        model: "gpt-4",
        riskDetected: riskAnalysis.risk_detected,
        riskScore: riskAnalysis.risk_score,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        },
        timestamp: new Date()
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }

  /**
   * Prompt para ambas as IAs funcionarem como terapeuta
   */
  buildTherapistPrompt(context) {
    return `
      Você é um assistente de saúde mental compassivo e treinado em técnicas de terapia cognitivo-comportamental (CBT) e dialética (DBT).

      Seu objetivo é:
      1. Validar e compreender os sentimentos do usuário
      2. Oferecer suporte emocional empático
      3. Sugerir técnicas de coping (respiração, mindfulness, etc)
      4. NUNCA diagnosticar ou prescrever medicações
      5. Realizar contatos com profissionais quando necessário

      Histórico emocional do usuário:
      - Emoção atual: ${context.currentEmotion}/5
      - Triggers recentes: ${context.triggers?.join(", ") || "nenhum"}
      - Padrões identificados: ${context.patterns?.join(", ") || "nenhum"}
      - Última atividade: ${context.lastActivity || "nunca"}

      IMPORTANTE:
      - Seja breve mas empático (2-3 frases máximo)
      - Use linguagem simples, evite jargão
      - NÃO finalize conversas abruptamente
      - Se detectar ideação suicida, ofereça CVV (188)
      - Sempre termine perguntando "Como você está se sentindo agora?"

      Responda de forma terapêutica e compassiva.
    `;
  }

  /**
   * Análise de risco - palavras-chave + análise semântica
   */
  async analyzeRisk(message) {
    const riskKeywords = [
      'suicídio', 'morrer', 'desista', 'ninguém me ama',
      'automutilação', 'cortar', 'não aguento mais',
      'melhor não estar aqui', 'machucado', 'overdose',
      'pular do prédio', 'me matar', 'corda', 'veneno'
    ];

    const hasRiskKeyword = riskKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    let riskScore = 0;

    if (hasRiskKeyword) {
      riskScore = 0.9; // Alto risco
    } else if (message.toLowerCase().includes('triste') ||
               message.toLowerCase().includes('depressivo')) {
      riskScore = 0.3; // Risco baixo
    }

    return {
      risk_detected: riskScore > 0.7,
      risk_score: riskScore
    };
  }

  /**
   * Resposta genérica se IA falhar
   */
  getFallbackResponse() {
    const fallbackResponses = [
      "Obrigado por compartilhar. Como você está se sentindo agora?",
      "Entendo. Você gostaria de tentar alguma técnica de respiração?",
      "Que bom que você está aqui. Você quer conversar mais?"
    ];

    return {
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      model: "fallback",
      riskDetected: false,
      timestamp: new Date()
    };
  }
}

module.exports = new AIService();
```

---

## 🔧 Configuração (.env)

```env
# DESENVOLVIMENTO (Gemini Gratuito)
GEMINI_API_KEY=sua_chave_gemini_aqui

# PRODUÇÃO (OpenAI GPT-4 Pago)
OPENAI_API_KEY=sua_chave_openai_aqui

# Controle
NODE_ENV=development
USE_GEMINI=true  # força uso de Gemini mesmo em prod

# IA Fallback
AI_TIMEOUT=10000  # timeout em ms
AI_MAX_RETRIES=2
```

---

## 📦 Instalação de Dependências

```bash
# Gemini
npm install @google/generative-ai

# OpenAI
npm install openai

# Análise de sentimentos (ambas IAs)
npm install natural
npm install compromise

# Cache (reduz custos)
npm install redis
```

---

## 🔐 Segurança das Chaves

### **Nunca faça isso:**
```javascript
// ❌ ERRADO
const apiKey = "sk-abc123...";  // Hardcoded!

// ❌ ERRADO
fetch(`https://api.openai.com?key=${process.env.OPENAI_API_KEY}`);
```

### **Faça assim:**
```javascript
// ✅ CORRETO
const apiKey = process.env.OPENAI_API_KEY;

// ✅ CORRETO - Backend apenas
const response = await openai.chat.completions.create({
  messages: [...],
  // API key fica no environment, nunca viaja pro cliente
});
```

### **Em Docker:**
```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app

# Copiar files
COPY . .

# Instalar deps
RUN npm install

# Variáveis vão via docker-compose, não hardcoded
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      NODE_ENV: production
```

---

## 💾 Cache para Reduzir Custos

```javascript
// src/services/CacheService.js
const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: 'redis',
      port: 6379
    });
  }

  /**
   * Antes de chamar a IA, checar cache
   */
  async getCachedResponse(userMessage) {
    const cacheKey = `ai:${this.hashMessage(userMessage)}`;
    const cached = await this.client.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  /**
   * Cachear respostas por 1 hora
   */
  async setCachedResponse(userMessage, response) {
    const cacheKey = `ai:${this.hashMessage(userMessage)}`;
    await this.client.setex(cacheKey, 3600, JSON.stringify(response));
  }

  hashMessage(message) {
    return require('crypto')
      .createHash('md5')
      .update(message)
      .digest('hex');
  }
}

// No chat handler:
const cached = await cacheService.getCachedResponse(userMessage);
if (cached) return cached; // Usar cache

const response = await aiService.generateResponse(userId, userMessage, context);
await cacheService.setCachedResponse(userMessage, response);
return response;
```

---

## 📊 Monitoramento de Uso

```javascript
// src/services/UsageService.js

class UsageService {
  async logUsage(model, tokensUsed, userId) {
    // Salvar no banco para análise
    await Usage.create({
      userId,
      model, // 'gemini' ou 'gpt-4'
      tokensUsed,
      cost: this.calculateCost(model, tokensUsed),
      timestamp: new Date()
    });
  }

  calculateCost(model, tokens) {
    if (model === 'gemini') return 0; // Gratuito
    if (model === 'gpt-4') {
      // GPT-4: $0.03 por 1K input, $0.06 por 1K output
      return (tokens / 1000) * 0.04; // média
    }
  }

  async getDailyCost() {
    const today = new Date().toISOString().split('T')[0];
    const usages = await Usage.findAll({
      where: {
        timestamp: { $gte: new Date(today) }
      }
    });

    return usages.reduce((sum, u) => sum + u.cost, 0);
  }
}
```

---

## 🚀 Deployment (Backend)

### **Variáveis de Ambiente Seguras**

```bash
# .env.local (NUNCA fazer commit!)
GEMINI_API_KEY=AIzaSyDa...
OPENAI_API_KEY=sk-proj-...

# .env.example (pode fazer commit - SEM valores reais)
GEMINI_API_KEY=seu_valor_aqui
OPENAI_API_KEY=seu_valor_aqui
```

### **Em Vercel/Railway/Heroku:**
1. Ir em Settings → Environment Variables
2. Adicionar suas chaves
3. Deploy automaticamente usa essas variáveis

---

## ✅ Boas Práticas

### **1. Sempre ter fallback**
```javascript
try {
  return await aiService.generateResponse(...);
} catch {
  return this.getFallbackResponse(); // Resposta genérica pronta
}
```

### **2. Rate limiting por usuário**
```javascript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 50, // máximo 50 chats por usuário
  message: "Muitas requisições. Tente novamente em 15 minutos."
});

app.post("/api/chat", rateLimiter, chatHandler);
```

### **3. Timeout**
```javascript
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject("Timeout"), 10000)
);

const response = await Promise.race([
  aiService.generateResponse(...),
  timeout
]);
```

### **4. Logging detalhado**
```javascript
logger.info(`IA Call`, {
  userId,
  model: response.model,
  tokens: response.usage?.totalTokens,
  cost: response.usage?.totalTokens * 0.00003,
  riskDetected: response.riskDetected,
  duration: Date.now() - startTime
});
```

---

## 🎯 Sumário

| Aspecto | Gemini | GPT-4 |
|---------|--------|-------|
| **Custo** | Gratuito | $20-200/mês |
| **Qualidade** | Boa | Excelente |
| **Uso** | Dev/Testes | Produção |
| **Setup** | Fácil | Fácil |
| **Suporte** | Som | Excelente |

**Final:** Use Gemini para desenvolver, GPT-4 em produção com cache + rate limiting!

