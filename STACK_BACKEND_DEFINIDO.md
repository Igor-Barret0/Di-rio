# 🔧 STACK DO BACKEND - Definido e Documentado

## 📋 Resumo Executivo

```
Node.js + Express + TypeScript + PostgreSQL + Redis + Docker
```

---

## 🏗️ Stack Completo do Backend

### **Core (Runtime + Framework)**
```
✅ Node.js 18+          → Runtime JavaScript
✅ Express.js           → Framework Web
✅ TypeScript           → Type-safe JavaScript
✅ Prisma ORM           → Database abstraction layer
```

### **Database & Cache**
```
✅ PostgreSQL 15        → Database relacional
✅ Redis 7              → Cache + Real-time
✅ 16 tabelas           → Schema otimizado
```

### **Autenticação & Segurança**
```
✅ JWT (JSON Web Token)          → Autenticação stateless
✅ bcrypt                        → Hash de passwords
✅ Google OAuth 2.0              → Login social
✅ Helmet                        → Security headers
✅ express-rate-limit            → Rate limiting
✅ CORS                          → Cross-origin
✅ crypto (Node native)          → Criptografia
```

### **IA & Processamento**
```
✅ Google Gemini API             → Desenvolvimento (gratuito)
✅ OpenAI GPT-4 API              → Produção (pago)
✅ natural.js                    → NLP/Análise de sentimentos
✅ compromise                    → Processamento de linguagem natural
```

### **Comunicação & Notificações**
```
✅ Socket.io                     → WebSocket real-time
✅ Nodemailer                    → Enviar emails
✅ SendGrid                      → Serviço de email em massa
✅ node-cron                     → Agendamento de tasks (backup, email)
```

### **Geração de Relatórios**
```
✅ PDFKit                        → Gerar PDFs (relatórios mensais)
✅ puppeteer (alternativa)       → HTML → PDF
```

### **Áudio & Mídia**
```
✅ Howler.js                     → Biblioteca de áudio (meditações guiadas)
```

### **Logging & Monitoramento**
```
✅ Winston                       → Logger robusto
✅ Morgan                        → HTTP request logs
```

### **Storage & Deploy**
```
✅ AWS S3                        → Backups + imagens
✅ Docker                        → Containerização
✅ Docker Compose                → Orquestração local
✅ Nginx                         → Reverse proxy
```

### **Testing (Recomendado)**
```
✅ Jest                          → Unit & integration tests
✅ Supertest                     → HTTP request testing
```

---

## 📦 Package.json Esperado

```json
{
  "name": "diario-emocional-backend",
  "version": "1.0.0",
  "description": "Backend do diário emocional com IA e suporte psicológico",
  "main": "dist/index.js",
  "type": "module",

  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "migrate": "prisma migrate deploy",
    "seed": "ts-node prisma/seed.ts"
  },

  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.2.0",
    "@types/express": "^4.17.17",

    "prisma": "^5.2.0",
    "@prisma/client": "^5.2.0",

    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",

    "@google/generative-ai": "^0.3.1",
    "openai": "^4.20.1",
    "natural": "^6.7.0",
    "compromise": "^14.10.1",

    "socket.io": "^4.7.1",
    "nodemailer": "^6.9.5",
    "@sendgrid/mail": "^7.7.0",
    "node-cron": "^3.0.2",

    "pdfkit": "^0.13.0",
    "puppeteer": "^21.3.0",
    "howler": "^2.2.4",

    "winston": "^3.10.0",
    "morgan": "^1.10.0",

    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.0.0",
    "dotenv": "^16.3.1",
    "axios": "^1.5.0",
    "uuid": "^9.0.0"
  },

  "devDependencies": {
    "@types/node": "^20.5.0",
    "@typescript-eslint/eslint-plugin": "^6.3.0",
    "@typescript-eslint/parser": "^6.3.0",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.3",
    "supertest": "^6.3.3",
    "prettier": "^3.0.1"
  }
}
```

---

## 🗂️ Estrutura de Pastas Esperada

```
backend/
├── src/
│   ├── index.ts                      # Entry point
│   │
│   ├── config/
│   │   ├── database.ts               # Prisma config
│   │   ├── redis.ts                  # Redis config
│   │   ├── env.ts                    # Environment vars
│   │   └── logger.ts                 # Winston logger
│   │
│   ├── middleware/
│   │   ├── auth.ts                   # JWT verification
│   │   ├── errorHandler.ts           # Error handling
│   │   ├── rateLimiter.ts            # Rate limiting
│   │   └── validation.ts             # Input validation
│   │
│   ├── routes/
│   │   ├── auth.ts                   # Autenticação
│   │   ├── posts.ts                  # Diário
│   │   ├── chat.ts                   # IA Chat
│   │   ├── assessments.ts            # PHQ-9, GAD-7
│   │   ├── triggers.ts               # Rastreamento
│   │   ├── goals.ts                  # Metas
│   │   ├── exercises.ts              # Mindfulness
│   │   ├── community.ts              # Feed anônimo
│   │   ├── resources.ts              # Contatos
│   │   ├── notifications.ts          # Notificações
│   │   ├── users.ts                  # Perfil
│   │   └── admin.ts                  # Admin panel
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── postController.ts
│   │   ├── chatController.ts
│   │   ├── adminController.ts
│   │   └── ... (um por raiz)
│   │
│   ├── services/
│   │   ├── AIService.ts              # Gemini + GPT
│   │   ├── EmailService.ts           # SendGrid
│   │   ├── PDFService.ts             # Gerar relatórios
│   │   ├── CacheService.ts           # Redis
│   │   ├── RiskDetectionService.ts   # Detecção de risco
│   │   ├── NotificationService.ts    # Real-time
│   │   └── AnalyticsService.ts       # Padrões
│   │
│   ├── utils/
│   │   ├── jwt.ts                    # JWT helpers
│   │   ├── crypto.ts                 # Criptografia
│   │   ├── validators.ts             # Validação
│   │   └── formatters.ts             # Formatação
│   │
│   ├── types/
│   │   ├── index.ts                  # Tipos globais
│   │   ├── user.ts
│   │   ├── post.ts
│   │   └── ... (todos os tipos)
│   │
│   ├── cron/
│   │   ├── backup.ts                 # Backup diário
│   │   ├── emailReminder.ts          # Lembretes
│   │   ├── analytics.ts              # Análise de padrões
│   │   └── badges.ts                 # Verificar badges
│   │
│   └── socket/
│       ├── handlers.ts               # WebSocket handlers
│       └── events.ts                 # Event definitions
│
├── prisma/
│   ├── schema.prisma                 # Schema do DB
│   ├── seed.ts                       # Seed data
│   └── migrations/                   # DB migrations
│
├── tests/
│   ├── auth.test.ts
│   ├── posts.test.ts
│   └── ... (testes)
│
├── .env.example                      # Template de env
├── .env                              # Vars de produção (NÃO fazer commit)
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── package.json
├── prettier.config.js
└── eslint.config.js
```

---

## 🔐 Arquivo .env

```env
# SERVIDOR
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# DATABASE
DATABASE_URL=postgresql://diary_user:sua_senha@localhost:5432/diary_db

# REDIS
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=sua_chave_super_secreta_minimo_32_caracteres_aleatorios
JWT_EXPIRES_IN=7d

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=sua_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua_client_secret

# IA - DESENVOLVIMENTO
GEMINI_API_KEY=sua_chave_gemini

# IA - PRODUÇÃO
OPENAI_API_KEY=sua_chave_openai

# EMAIL
SENDGRID_API_KEY=sua_chave_sendgrid
SENDGRID_FROM_EMAIL=noreply@diarioemocional.com
SENDGRID_FROM_NAME=Diário Emocional

# AWS S3 (Backups)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET=diary-backups
AWS_REGION=us-east-1

# LOGGING
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# CORS
CORS_ORIGIN=http://localhost:3000,https://diarioemocional.com

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Exemplo: Estrutura de Rota (Express + TypeScript)

```typescript
// src/routes/chat.ts
import express, { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { chatController } from '../controllers/chatController';

const router: Router = express.Router();

// POST /api/chat - Enviar mensagem para IA
router.post('/', authMiddleware, chatController.sendMessage);

// GET /api/chat/history - Histórico de conversas
router.get('/history', authMiddleware, chatController.getHistory);

// GET /api/chat/:conversationId - Detalhes de conversa
router.get('/:conversationId', authMiddleware, chatController.getConversation);

// DELETE /api/chat/:conversationId - Deletar conversa
router.delete('/:conversationId', authMiddleware, chatController.deleteConversation);

export default router;
```

---

## 🔧 Exemplo: Service com IA Dual

```typescript
// src/services/AIService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

class AIService {
  private gemini: GoogleGenerativeAI;
  private openai: OpenAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(userId: string, message: string, context: any) {
    try {
      if (process.env.NODE_ENV === 'development') {
        return await this.callGemini(message, context);
      }
      return await this.callGPT(message, context);
    } catch (error) {
      console.error("AI Error:", error);
      return this.getFallbackResponse();
    }
  }

  private async callGemini(message: string, context: any) {
    const model = this.gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      this.buildTherapistPrompt(message, context)
    );

    return result.response.text();
  }

  private async callGPT(message: string, context: any) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: this.buildTherapistPrompt(message, context),
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0].message.content;
  }

  private buildTherapistPrompt(message: string, context: any) {
    return `Você é um terapeuta compassivo. Contexto: ${JSON.stringify(context)}. Responda a: ${message}`;
  }

  private getFallbackResponse() {
    return "Obrigado por compartilhar. Como você está se sentindo agora?";
  }
}

export const aiService = new AIService();
```

---

## ✅ Definições Finalizadas

| Aspecto | Definido |
|---------|----------|
| Runtime | ✅ Node.js 18+ |
| Framework | ✅ Express.js |
| Linguagem | ✅ TypeScript |
| Database | ✅ PostgreSQL 15 |
| Cache | ✅ Redis 7 |
| ORM | ✅ Prisma |
| Auth | ✅ JWT + bcrypt + OAuth |
| IA | ✅ Gemini (dev) + GPT-4 (prod) |
| Real-time | ✅ Socket.io |
| Email | ✅ SendGrid |
| PDF | ✅ PDFKit |
| Storage | ✅ AWS S3 |
| Logging | ✅ Winston + Morgan |
| Security | ✅ Helmet + Rate Limiting |
| Container | ✅ Docker |

---

## 📄 Documentação Criada

✅ `PLANO_DESENVOLVIMENTO.md` - Stack completo
✅ `ESTRATEGIA_IA.md` - Detalhes IA Gemini + GPT
✅ `PALETA_CORES.md` - Design system
✅ Este arquivo - Backend definido

---

## 🎯 Próximo Passo: Setup do Projeto?

Quer que eu:
1. **Crie a estrutura de pastas** (Git + Docker)?
2. **Gere o Dockerfile + docker-compose.yml** pronto para rodar?
3. **Crie o schema Prisma** (13 tabelas otimizadas)?
4. **Comece as APIs** (Auth primeira)?

Qual você quer? 🚀
