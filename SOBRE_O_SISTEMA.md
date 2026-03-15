# Diário Emocional Escolar — O que é e como funciona?

> Este documento foi escrito para qualquer pessoa entender o sistema, mesmo sem conhecimento em tecnologia.

---

## O que é o Diário Emocional Escolar?

É uma **plataforma digital voltada para estudantes** que permite registrar e acompanhar como você está se sentindo emocionalmente ao longo do tempo. Funciona como um diário pessoal, mas com ferramentas que ajudam a identificar padrões, oferecer suporte e alertar profissionais quando um aluno precisa de atenção.

O sistema foi criado pensando no bem-estar dos estudantes dentro do ambiente escolar, conectando alunos, conselheiros e administradores em um só lugar.

**Acesse em:** https://di-rio-ten.vercel.app

---

## Para quem é o sistema?

O sistema tem três tipos de usuário:

| Tipo | Quem é | O que pode fazer |
|------|--------|-----------------|
| **Estudante** | Aluno da escola | Registrar humor, conversar com IA, fazer avaliações, criar metas |
| **Conselheiro** | Psicólogo ou orientador | Visualizar dados dos alunos, identificar alunos em risco |
| **Admin** | Gestor do sistema | Gerenciar todos os usuários e recursos da plataforma |

---

## O que o estudante pode fazer?

### 1. Registrar o humor do dia
Todo dia, o estudante escolhe como está se sentindo entre as opções:
- 😊 Feliz
- ⚡ Animado
- 😐 Neutro
- 😰 Ansioso
- 😢 Triste
- 😤 Irritado
- 😴 Cansado

Também pode escrever uma anotação explicando o motivo. **Apenas um registro por dia é permitido**, para criar um hábito saudável de reflexão.

---

### 2. Ver seu histórico e gráficos
O sistema guarda todos os registros e mostra:
- Um **gráfico semanal** com a evolução do humor
- Quais emoções aparecem com mais frequência
- Sua sequência de dias registrados (como um streak)

---

### 3. Conversar com a IA de apoio
O sistema tem um **assistente de inteligência artificial** (como um chatbot) especializado em saúde emocional. O estudante pode conversar sobre como está se sentindo, tirar dúvidas sobre emoções ou simplesmente desabafar.

> **Importante:** A IA não substitui um psicólogo. Em casos de risco, o sistema alerta os responsáveis.

---

### 4. Fazer avaliações de saúde mental
São questionários científicos usados por profissionais de saúde:
- **PHQ-9** — Avalia sinais de depressão (9 perguntas)
- **GAD-7** — Avalia sinais de ansiedade (7 perguntas)
- **AUDIT** — Avalia o consumo de álcool (10 perguntas)

O resultado classifica o nível de risco e orienta o estudante.

---

### 5. Participar de desafios
Pequenos desafios de bem-estar para criar hábitos saudáveis, como:
- Meditar por 7 dias seguidos
- Dormir 8 horas por 5 dias
- Praticar gratidão diariamente

Cada desafio concluído dá pontos (XP) e conquistas.

---

### 6. Criar metas pessoais
O estudante pode criar suas próprias metas e marcar quando as concluir. Exemplos:
- "Estudar 1 hora por dia"
- "Praticar esporte 3 vezes por semana"

---

### 7. Sistema de gamificação (XP e níveis)
Para incentivar o uso, o sistema tem um sistema de pontuação:
- Registrar humor = ganhar XP
- Completar desafios = ganhar XP e conquistas
- Quanto mais XP, maior o nível do estudante

---

### 8. Notificações e lembretes
O sistema envia lembretes para o estudante registrar seu humor no horário configurado. Também notifica quando:
- Uma conquista é desbloqueada
- Um desafio é concluído
- Há alertas importantes

---

### 9. Recursos de apoio
Uma seção com contatos e links de organizações de apoio à saúde mental, como:
- **CVV** — Centro de Valorização da Vida (telefone 188, chat)
- **CAPS** — Centro de Atenção Psicossocial
- **SAMU** — Emergências médicas

---

## O que o administrador pode fazer?

O administrador tem acesso a um **painel de controle** separado onde pode:

- **Ver estatísticas gerais** — total de alunos, registros do dia, quantos estão em situação de risco
- **Gerenciar usuários** — ver perfis, alterar permissões, desativar contas
- **Gerenciar recursos** — adicionar, editar ou remover links e contatos de apoio
- **Identificar alunos em risco** — ver quais alunos têm registros preocupantes para encaminhar ao suporte

---

## Como o sistema protege a privacidade?

- Todos os dados são **criptografados**
- Apenas o próprio estudante vê suas anotações pessoais
- Os administradores veem apenas dados gerais e alertas de risco
- Nenhuma informação é compartilhada com terceiros sem autorização
- O login pode ser feito com **Google** (sem precisar lembrar outra senha)

---

## Como entrar no sistema?

1. Acesse **https://di-rio-ten.vercel.app**
2. Clique em **"Criar conta"**
3. Preencha nome, e-mail e senha — ou use o botão **"Continuar com Google"**
4. Pronto! Você já pode registrar seu primeiro humor

---

## Tecnologias utilizadas (para quem tiver curiosidade)

O sistema foi desenvolvido com tecnologias modernas e gratuitas:

| Parte | O que é | Onde roda |
|-------|---------|-----------|
| **Site (frontend)** | A interface que o usuário vê | Vercel (gratuito) |
| **Servidor (backend)** | A parte que processa os dados | Render (gratuito) |
| **Banco de dados** | Onde as informações são salvas | Neon PostgreSQL (gratuito) |
| **Cache/sessões** | Armazenamento rápido temporário | Upstash Redis (gratuito) |
| **E-mails** | Envio de notificações por email | SendGrid (gratuito) |
| **Inteligência Artificial** | Chatbot de apoio emocional | Google Gemini |

> **Custo atual de operação: R$ 0,00/mês** — todos os serviços estão na camada gratuita.

---

## Dúvidas frequentes

**O sistema substitui o psicólogo?**
Não. O sistema é uma ferramenta de apoio e monitoramento. Em situações de risco, ele alerta os profissionais responsáveis, mas não substitui o atendimento humano.

**Meus registros são visíveis para professores?**
Não. Apenas administradores e conselheiros designados têm acesso aos dados, e somente para fins de cuidado e suporte.

**Posso usar pelo celular?**
Sim. O site funciona em qualquer dispositivo com navegador — computador, tablet ou celular.

**E se eu esquecer minha senha?**
Clique em "Esqueci a senha" na tela de login. Você receberá um e-mail com instruções para criar uma nova senha.

---

*Sistema desenvolvido para promover o bem-estar emocional no ambiente escolar.*