# 📓 Diário Emocional Escolar — Funcionalidades

Aplicativo web para estudantes registrarem e acompanharem seu bem-estar emocional ao longo do tempo.

---

## 🖥️ Páginas

### 🔐 Login / Onboarding (`/login`)
- Tela de boas-vindas com banner hero e gradiente
- Apresentação das 3 funcionalidades principais em cards (Registro Diário, Histórico Visual, Insights Personalizados)
- Seletor de humor integrado na própria tela de onboarding
- Botão de acesso direto ao app

---

### 🏠 Dashboard (`/dashboard`)
- **Registro diário de humor**: seleção por emoji com 5 opções (Ótimo, Bem, Neutro, Triste, Ansioso)
- **Banner de lembrete**: exibido quando o usuário ainda não registrou o humor do dia
- **Resumo do dia**: card com o registro atual após o check-in
- **Campo de nota**: texto livre para descrever como o usuário está se sentindo
- **Nível de bem-estar**: indicador de 1 a 10 com barra de progresso animada
- **Cartões de estatísticas rápidas**: sequência de dias, total de registros, média de bem-estar e humor mais frequente
- **Gráfico "Sua Jornada"**: evolução do humor nos últimos 7 ou 30 dias (com abas de seleção)
- **Seção Insights**: cards de dicas contextuais baseados no humor recente
- **Alerta de suporte emocional**: banner especial exibido automaticamente quando o usuário registra humores negativos por vários dias seguidos

---

### 📅 Histórico (`/historico`)
- **Gráfico de barras**: visualização da distribuição de humores por período (7 ou 30 dias)
- **Calendário Emocional**: calendário estilo "GitHub contributions" com cores por humor para cada dia do mês
- **Registros Recentes**: lista cronológica de todos os registros com:
  - Emoji e nome do humor
  - Data e hora do registro
  - Nota escrita pelo usuário
  - Nível de bem-estar
- **Estado vazio**: mensagem ilustrada quando não há registros

---

### 💡 Insights & Apoio (`/insights`)
- **Card: Exercício de Respiração**: técnica 4-7-8 com botão para assistir vídeo
- **Card: Vídeo Educativo**: conteúdo sobre ansiedade com player integrado
- **Card: Frase do Dia**: frase motivacional rotativa por tema
- **Banner de Alerta**: exibido automaticamente quando o usuário registra 3+ dias com humor negativo, com botão "Procurar Apoio Agora"
- **Card CTA**: link para o Guia de Saúde Mental do Governo Federal
- **Player de vídeo**: modal com iframe do YouTube para os vídeos educativos

---

### 👤 Perfil (`/perfil`)

#### Aba — Perfil
- **Avatar com iniciais**: gerado a partir do nome do usuário
- **Informações do estudante**: nome, turma e escola
- **Card de engajamento**: barra de progresso com pontuação de dedicação
- **Estatísticas detalhadas**: total de registros e média de bem-estar com gráfico de arco
- **Distribuição de humor**: barras de progresso para cada categoria de humor com percentual

#### Aba — Configurações
- **Edição de perfil**: campos para nome, turma e escola com salvamento local
- **Aparência**: toggle para alternar entre modo claro e modo escuro
- **Preferências**: toggle para ativar/desativar notificações diárias e modo anônimo
- **Meus Dados**: botão para exportar registros em JSON e botão para apagar todos os dados
- **Conquistas** *(em breve)*: seção reservada para sistema de badges

---

## ⚙️ Funcionalidades Técnicas

| Recurso | Detalhe |
|---|---|
| **Armazenamento** | `localStorage` — dados ficam no dispositivo do usuário, sem servidor |
| **Persistência de perfil** | Nome, turma, escola, preferências salvas localmente |
| **Tema** | Modo claro e escuro com `next-themes`, adaptação automática |
| **Animações** | Transições suaves com `framer-motion` em todas as páginas |
| **Responsividade** | Layout adaptado para mobile, tablet e desktop |
| **Exportação de dados** | Download do histórico completo em arquivo `.json` |
| **Remoção de dados** | Apaga todos os registros com confirmação |

---

## 🎨 Design

- Paleta primária em azul/índigo com gradientes suaves
- Cards arredondados com sombras premium
- Navbar flutuante com efeito glassmorphism
- Sidebar colapsável no desktop
- Suporte completo a modo escuro e claro
