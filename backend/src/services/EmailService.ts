import sgMail from "@sendgrid/mail";
import { env } from "../config/env";
import { logger } from "../config/logger";

// Initialise SendGrid only when a key is configured
if (env.sendgrid.apiKey) {
  sgMail.setApiKey(env.sendgrid.apiKey);
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Core sender ──────────────────────────────────────────────────────────────

async function send(options: MailOptions): Promise<void> {
  if (!env.sendgrid.apiKey) {
    logger.debug("SendGrid key not configured — email skipped", {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  try {
    await sgMail.send({
      from: { email: env.sendgrid.fromEmail, name: env.sendgrid.fromName },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]+>/g, ""),
    });

    logger.info("Email sent", { to: options.to, subject: options.subject });
  } catch (err) {
    logger.error("Email send failed", { to: options.to, err });
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function sendWelcome(to: string, name: string): Promise<void> {
  await send({
    to,
    subject: `Bem-vindo(a), ${name}! 💙`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#6366f1">Olá, ${name}! 👋</h2>
        <p>É muito bom ter você aqui no <strong>Diário Emocional</strong>.</p>
        <p>Você pode começar registrando como está se sentindo hoje — leva apenas 30 segundos.</p>
        <p>Também temos um assistente de IA que pode conversar com você quando quiser.</p>
        <br/>
        <p style="color:#64748b;font-size:13px">
          Se precisar de apoio imediato, o CVV está disponível 24h:
          <strong>ligue 188</strong> ou acesse <a href="https://cvv.org.br">cvv.org.br</a> (gratuito e sigiloso).
        </p>
      </div>
    `,
  });
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordReset(
  to: string,
  name: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  await send({
    to,
    subject: "Redefinição de senha — Diário Emocional",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#6366f1">Olá, ${name}</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0">
          Redefinir senha
        </a>
        <p style="color:#64748b;font-size:12px">
          Este link expira em 1 hora.<br/>
          Se você não solicitou isso, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

// ─── Social login reminder email ──────────────────────────────────────────────

export async function sendSocialLoginReminder(to: string, name: string): Promise<void> {
  const loginUrl = `${env.frontendUrl}/login`;
  await send({
    to,
    subject: "Acesso à sua conta — Diário Emocional",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#6366f1">Olá, ${name}</h2>
        <p>Recebemos uma solicitação de recuperação de senha para esta conta.</p>
        <p>Sua conta foi criada com o <strong>Google</strong>, por isso não possui senha cadastrada.</p>
        <p>Para acessar, use o botão <strong>"Continuar com Google"</strong> na tela de login:</p>
        <a href="${loginUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0">
          Ir para o login
        </a>
        <p style="color:#64748b;font-size:12px">
          Se você não solicitou isso, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

// ─── Mood reminder email ──────────────────────────────────────────────────────

export async function sendMoodReminder(to: string, name: string): Promise<void> {
  await send({
    to,
    subject: "Como você está hoje? 🌱",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#6366f1">Oi, ${name}!</h2>
        <p>Você ainda não registrou seu humor hoje. Que tal tirar 30 segundinhos?</p>
        <p>Registrar como você está ajuda a identificar padrões e cuidar melhor de você mesmo(a).</p>
        <a href="${env.frontendUrl}/dashboard"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0">
          Registrar humor agora
        </a>
        <p style="color:#64748b;font-size:12px">
          Para parar de receber lembretes por e-mail, acesse Configurações no app.
        </p>
      </div>
    `,
  });
}

// ─── High risk alert (to counselor, if integrated) ───────────────────────────

export async function sendRiskAlert(
  counselorEmail: string,
  studentName: string,
  riskDetails: string,
): Promise<void> {
  await send({
    to: counselorEmail,
    subject: `⚠️ Alerta de risco — ${studentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#ef4444">Alerta de risco detectado</h2>
        <p>O sistema detectou um possível sinal de risco para <strong>${studentName}</strong>.</p>
        <p><strong>Detalhes:</strong> ${riskDetails}</p>
        <p>Por favor, verifique o perfil do estudante no painel administrativo.</p>
        <p style="color:#64748b;font-size:12px">
          Este é um alerta automático. Certifique-se de seguir os protocolos institucionais.
        </p>
      </div>
    `,
  });
}
