/*
 * Sistema di Webhook Email per DMS
 * Intercetta le risposte alle email e le inoltra al sistema GitHub
 */

// Configurazione webhook email
const EMAIL_WEBHOOK_CONFIG = {
    // Servizio di forwarding email (es: Zapier, IFTTT, o servizio custom)
    webhookUrl: 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/',
    
    // Configurazione GitHub per ricevere le risposte
    githubRepo: 'Chcndr/dms-access-tracker',
    
    // Email di origine (la tua)
    fromEmail: 'checchi@me.com'
};

// Funzione per configurare il forwarding automatico delle risposte
async function setupEmailForwarding(userEmail, issueNumber, jti) {
    
    console.log('🔧 Configurazione forwarding email automatico');
    
    // Genera un identificatore univoco per questa richiesta
    const forwardingId = `dms-${issueNumber}-${jti.substring(0,8)}`;
    
    // Configurazione del forwarding
    const forwardingConfig = {
        id: forwardingId,
        fromEmail: EMAIL_WEBHOOK_CONFIG.fromEmail,
        userEmail: userEmail,
        issueNumber: issueNumber,
        jti: jti,
        githubRepo: EMAIL_WEBHOOK_CONFIG.githubRepo,
        createdAt: new Date().toISOString()
    };
    
    console.log('📧 Configurazione forwarding:', forwardingConfig);
    
    // In un sistema reale, qui configureresti:
    // 1. Un filtro email che intercetta le risposte a checchi@me.com
    // 2. Un webhook che estrae il contenuto della risposta
    // 3. Un sistema che posta automaticamente la risposta come commento nell'Issue GitHub
    
    // Per ora, salviamo la configurazione localmente per il tracking
    const configKey = `dms_email_forwarding_${forwardingId}`;
    localStorage.setItem(configKey, JSON.stringify(forwardingConfig));
    
    return forwardingConfig;
}

// Funzione per simulare la ricezione di una risposta email
async function simulateEmailResponse(forwardingId, responseText = '') {
    
    const configKey = `dms_email_forwarding_${forwardingId}`;
    const config = JSON.parse(localStorage.getItem(configKey) || '{}');
    
    if (!config.issueNumber) {
        throw new Error('Configurazione forwarding non trovata');
    }
    
    console.log('📧 Simulazione risposta email ricevuta:', {
        forwardingId: forwardingId,
        responseText: responseText,
        issueNumber: config.issueNumber
    });
    
    // Simula l'aggiunta del commento all'Issue GitHub
    const commentData = {
        issueNumber: config.issueNumber,
        userEmail: config.userEmail,
        responseText: responseText,
        receivedAt: new Date().toISOString(),
        method: 'email_forwarding_simulation'
    };
    
    // Salva la risposta per il sistema di polling
    const responseKey = `dms_email_response_${config.issueNumber}`;
    localStorage.setItem(responseKey, JSON.stringify(commentData));
    
    console.log('✅ Risposta email processata e salvata per il polling');
    
    return commentData;
}

// Funzione per verificare se c'è una risposta email per un Issue
function checkEmailResponse(issueNumber) {
    const responseKey = `dms_email_response_${issueNumber}`;
    const response = localStorage.getItem(responseKey);
    
    if (response) {
        try {
            return JSON.parse(response);
        } catch (e) {
            localStorage.removeItem(responseKey);
            return null;
        }
    }
    
    return null;
}

// Esporta le funzioni per l'uso nel sistema principale
window.DMS_EMAIL_WEBHOOK = {
    setupEmailForwarding,
    simulateEmailResponse,
    checkEmailResponse
};
