/**
 * Templates de email para o Canal de Ouvidoria
 */

// Estilo base compartilhado
const baseStyles = `
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  .content {
    padding: 30px;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
    color: white !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
  }
  .info-box {
    background-color: #ebf8ff;
    border-left: 4px solid #3182ce;
    padding: 15px;
    margin: 20px 0;
    border-radius: 0 6px 6px 0;
  }
  .warning-box {
    background-color: #fffaf0;
    border-left: 4px solid #dd6b20;
    padding: 15px;
    margin: 20px 0;
    border-radius: 0 6px 6px 0;
  }
  .success-box {
    background-color: #f0fff4;
    border-left: 4px solid #38a169;
    padding: 15px;
    margin: 20px 0;
    border-radius: 0 6px 6px 0;
  }
  .footer {
    background-color: #f7fafc;
    padding: 20px 30px;
    text-align: center;
    font-size: 12px;
    color: #718096;
    border-top: 1px solid #e2e8f0;
  }
  .protocol {
    font-family: monospace;
    font-size: 18px;
    font-weight: bold;
    color: #2c5282;
    background-color: #ebf8ff;
    padding: 10px 20px;
    border-radius: 6px;
    display: inline-block;
  }
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 20px 0;
  }
`;

// Wrapper HTML base
function wrapTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      ${content}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Template: Magic Link para login
 */
export function magicLinkTemplate(data: {
  nome: string;
  magicLink: string;
  expiresIn: string;
  ip: string;
}): { subject: string; html: string; text: string } {
  const content = `
    <div class="header">
      <h1>🔐 Acesso ao Sistema</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${data.nome}</strong>!</p>
      
      <p>Você solicitou acesso ao Canal de Ouvidoria. Clique no botão abaixo para entrar:</p>
      
      <div style="text-align: center;">
        <a href="${data.magicLink}" class="button">Acessar Sistema</a>
      </div>
      
      <div class="warning-box">
        <strong>⚠️ Atenção:</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Este link expira em <strong>${data.expiresIn}</strong></li>
          <li>O link só pode ser usado uma vez</li>
          <li>Se você não solicitou este acesso, ignore este email</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 12px; color: #718096;">
        Solicitação feita do IP: ${data.ip}<br>
        Se não foi você, sua conta pode estar em risco.
      </p>
    </div>
    <div class="footer">
      <p>Este é um email automático do Canal de Ouvidoria.</p>
      <p>Por favor, não responda a este email.</p>
    </div>
  `;

  return {
    subject: '🔐 Seu link de acesso - Canal de Ouvidoria',
    html: wrapTemplate(content, 'Acesso ao Sistema'),
    text: `
Olá, ${data.nome}!

Você solicitou acesso ao Canal de Ouvidoria.

Clique no link abaixo para entrar:
${data.magicLink}

⚠️ ATENÇÃO:
- Este link expira em ${data.expiresIn}
- O link só pode ser usado uma vez
- Se você não solicitou este acesso, ignore este email

Solicitação feita do IP: ${data.ip}

---
Este é um email automático do Canal de Ouvidoria.
    `.trim(),
  };
}

/**
 * Template: Confirmação de relato criado
 */
export function relatoCriadoTemplate(data: {
  protocolo: string;
  tipo: string;
  identificado: boolean;
  nome?: string;
  consultaUrl: string;
}): { subject: string; html: string; text: string } {
  const saudacao = data.identificado && data.nome 
    ? `Olá, <strong>${data.nome}</strong>!` 
    : 'Olá!';

  const content = `
    <div class="header">
      <h1>📋 Relato Registrado</h1>
    </div>
    <div class="content">
      <p>${saudacao}</p>
      
      <p>Seu relato foi registrado com sucesso em nosso Canal de Ouvidoria.</p>
      
      <div class="success-box">
        <p style="margin: 0;"><strong>Número do Protocolo:</strong></p>
        <p style="margin: 10px 0 0 0;"><span class="protocol">${data.protocolo}</span></p>
      </div>
      
      <p><strong>Tipo do relato:</strong> ${data.tipo}</p>
      
      <div class="info-box">
        <strong>📌 Guarde este protocolo!</strong>
        <p style="margin: 10px 0 0 0;">
          Você precisará dele para acompanhar o status do seu relato e receber atualizações.
        </p>
      </div>
      
      <p>Para consultar o status do seu relato, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="${data.consultaUrl}" class="button">Consultar Status</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #4a5568;">
        <strong>Próximos passos:</strong>
      </p>
      <ol style="color: #4a5568;">
        <li>Nossa equipe irá analisar seu relato</li>
        <li>Você receberá atualizações por email</li>
        <li>Pode consultar o status a qualquer momento usando o protocolo</li>
      </ol>
    </div>
    <div class="footer">
      <p>Este é um email automático do Canal de Ouvidoria.</p>
      <p>Sua identidade está protegida conforme nossa política de privacidade.</p>
    </div>
  `;

  return {
    subject: `📋 Relato registrado - Protocolo ${data.protocolo}`,
    html: wrapTemplate(content, 'Relato Registrado'),
    text: `
${data.identificado && data.nome ? `Olá, ${data.nome}!` : 'Olá!'}

Seu relato foi registrado com sucesso em nosso Canal de Ouvidoria.

NÚMERO DO PROTOCOLO: ${data.protocolo}

Tipo do relato: ${data.tipo}

📌 GUARDE ESTE PROTOCOLO!
Você precisará dele para acompanhar o status do seu relato.

Para consultar o status, acesse:
${data.consultaUrl}

PRÓXIMOS PASSOS:
1. Nossa equipe irá analisar seu relato
2. Você receberá atualizações por email
3. Pode consultar o status a qualquer momento usando o protocolo

---
Este é um email automático do Canal de Ouvidoria.
    `.trim(),
  };
}

/**
 * Template: Relato respondido
 */
export function relatoRespondidoTemplate(data: {
  protocolo: string;
  nome?: string;
  resposta: string;
  consultaUrl: string;
}): { subject: string; html: string; text: string } {
  const saudacao = data.nome ? `Olá, <strong>${data.nome}</strong>!` : 'Olá!';

  const content = `
    <div class="header">
      <h1>✉️ Resposta ao seu Relato</h1>
    </div>
    <div class="content">
      <p>${saudacao}</p>
      
      <p>Seu relato foi analisado e temos uma resposta para você.</p>
      
      <div class="info-box">
        <p style="margin: 0;"><strong>Protocolo:</strong> <span class="protocol">${data.protocolo}</span></p>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>Resposta da Ouvidoria:</strong></p>
      
      <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${data.resposta}</p>
      </div>
      
      <div class="divider"></div>
      
      <p>Para ver mais detalhes ou enviar uma nova mensagem:</p>
      
      <div style="text-align: center;">
        <a href="${data.consultaUrl}" class="button">Acessar Relato</a>
      </div>
    </div>
    <div class="footer">
      <p>Este é um email automático do Canal de Ouvidoria.</p>
      <p>Agradecemos por utilizar nosso canal de comunicação.</p>
    </div>
  `;

  return {
    subject: `✉️ Resposta ao seu relato - Protocolo ${data.protocolo}`,
    html: wrapTemplate(content, 'Resposta ao Relato'),
    text: `
${data.nome ? `Olá, ${data.nome}!` : 'Olá!'}

Seu relato foi analisado e temos uma resposta para você.

PROTOCOLO: ${data.protocolo}

RESPOSTA DA OUVIDORIA:
${data.resposta}

Para ver mais detalhes, acesse:
${data.consultaUrl}

---
Este é um email automático do Canal de Ouvidoria.
Agradecemos por utilizar nosso canal de comunicação.
    `.trim(),
  };
}

/**
 * Template: Alerta de novo relato urgente (para equipe)
 */
export function alertaRelatoUrgenteTemplate(data: {
  protocolo: string;
  tipo: string;
  prioridade: string;
  comite: string;
  descricaoPreview: string;
  linkAdmin: string;
}): { subject: string; html: string; text: string } {
  const content = `
    <div class="header" style="background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);">
      <h1>🚨 Novo Relato Urgente</h1>
    </div>
    <div class="content">
      <div class="warning-box" style="background-color: #fff5f5; border-left-color: #c53030;">
        <strong>⚠️ ATENÇÃO: Este relato requer análise imediata!</strong>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Protocolo:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span class="protocol">${data.protocolo}</span></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Tipo:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Prioridade:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <span style="background-color: #c53030; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
              ${data.prioridade}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Comitê:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.comite}</td>
        </tr>
      </table>
      
      <p><strong>Prévia da descrição:</strong></p>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <p style="margin: 0; color: #4a5568;">${data.descricaoPreview}...</p>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <a href="${data.linkAdmin}" class="button" style="background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);">
          Ver Relato Completo
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Este é um alerta automático do Canal de Ouvidoria.</p>
      <p>Por favor, tome as providências necessárias o mais rápido possível.</p>
    </div>
  `;

  return {
    subject: `🚨 URGENTE: Novo relato ${data.prioridade} - ${data.protocolo}`,
    html: wrapTemplate(content, 'Alerta de Relato Urgente'),
    text: `
🚨 NOVO RELATO URGENTE

⚠️ ATENÇÃO: Este relato requer análise imediata!

PROTOCOLO: ${data.protocolo}
TIPO: ${data.tipo}
PRIORIDADE: ${data.prioridade}
COMITÊ: ${data.comite}

PRÉVIA DA DESCRIÇÃO:
${data.descricaoPreview}...

Acesse o sistema para ver o relato completo:
${data.linkAdmin}

---
Este é um alerta automático do Canal de Ouvidoria.
    `.trim(),
  };
}

/**
 * Template: Relato transferido (notificação para novo comitê)
 */
export function relatoTransferidoTemplate(data: {
  protocolo: string;
  tipo: string;
  prioridade: string;
  comiteOrigem: string;
  comiteDestino: string;
  motivo: string;
  linkAdmin: string;
}): { subject: string; html: string; text: string } {
  const content = `
    <div class="header">
      <h1>📤 Relato Transferido</h1>
    </div>
    <div class="content">
      <p>Um relato foi transferido para o seu comitê.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Protocolo:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span class="protocol">${data.protocolo}</span></td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Tipo:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.tipo}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Prioridade:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.prioridade}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Origem:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.comiteOrigem}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Destino:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>${data.comiteDestino}</strong></td>
        </tr>
      </table>
      
      <div class="info-box">
        <p style="margin: 0;"><strong>Motivo da transferência:</strong></p>
        <p style="margin: 10px 0 0 0;">${data.motivo}</p>
      </div>
      
      <div style="text-align: center; margin-top: 25px;">
        <a href="${data.linkAdmin}" class="button">Ver Relato</a>
      </div>
    </div>
    <div class="footer">
      <p>Este é um email automático do Canal de Ouvidoria.</p>
    </div>
  `;

  return {
    subject: `📤 Relato transferido para seu comitê - ${data.protocolo}`,
    html: wrapTemplate(content, 'Relato Transferido'),
    text: `
📤 RELATO TRANSFERIDO

Um relato foi transferido para o seu comitê.

PROTOCOLO: ${data.protocolo}
TIPO: ${data.tipo}
PRIORIDADE: ${data.prioridade}
ORIGEM: ${data.comiteOrigem}
DESTINO: ${data.comiteDestino}

MOTIVO DA TRANSFERÊNCIA:
${data.motivo}

Acesse o sistema para ver o relato:
${data.linkAdmin}

---
Este é um email automático do Canal de Ouvidoria.
    `.trim(),
  };
}