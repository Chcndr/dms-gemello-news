/* 
 * DMS Email Webhook Handler
 * Riceve risposte email e attiva automaticamente le sessioni
 */

// Configurazione
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Chcndr';
const REPO_NAME = 'dms-gemello-news';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dms-webhook-secret-2025';

// Funzione per triggere GitHub Actions
async function triggerSessionActivation(email, token, minutes = 60) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/activate-session.yml/dispatches`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        email: email,
        token: token,
        minutes: minutes.toString()
      }
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Funzione per estrarre email e token dalla risposta
function parseEmailResponse(emailContent) {
  // Cerca pattern nel contenuto email per estrarre i dati
  const emailMatch = emailContent.match(/(?:from|reply):\s*([^\s@]+@[^\s@]+\.[^\s@]+)/i);
  const tokenMatch = emailContent.match(/token[=:]?\s*([a-zA-Z0-9-]+)/i);
  
  return {
    email: emailMatch ? emailMatch[1].toLowerCase().trim() : null,
    token: tokenMatch ? tokenMatch[1].trim() : null
  };
}

// Handler principale webhook
export default async function handler(req, res) {
  // Verifica metodo
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verifica secret webhook (sicurezza base)
    const providedSecret = req.headers['x-webhook-secret'] || req.body.secret;
    if (providedSecret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    // Estrai dati dalla richiesta
    const emailData = req.body;
    console.log('📧 Webhook ricevuto:', JSON.stringify(emailData, null, 2));

    // Parse email content
    const { email, token } = parseEmailResponse(JSON.stringify(emailData));
    
    if (!email || !token) {
      console.log('❌ Email o token non trovati nel contenuto');
      return res.status(400).json({ 
        error: 'Email or token not found in webhook data',
        parsed: { email, token }
      });
    }

    console.log('✅ Dati estratti:', { email, token });

    // Triggera GitHub Actions per attivare la sessione
    const result = await triggerSessionActivation(email, token, 60);
    
    console.log('🚀 GitHub Actions triggerato:', result);

    // Invia notifica di successo
    return res.status(200).json({
      success: true,
      message: 'Session activation triggered',
      email: email,
      token: token,
      duration: '60 minutes',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Errore webhook:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Configurazione per Vercel/Netlify
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
