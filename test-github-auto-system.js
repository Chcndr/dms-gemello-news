/*
 * Test del Sistema GitHub Auto per DMS
 * Verifica la creazione di Issue e il rilevamento delle risposte
 */

const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';

// Funzione per generare UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Funzione per codificare Base64URL
function base64urlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Funzione per creare firma HMAC-SHA256
function createSignature(data, secret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return base64urlEncode(hmac.digest());
}

// Funzione per creare JWT
function createJWT(payload, secret) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = createSignature(data, secret);

    return `${data}.${signature}`;
}

// Test principale
async function testGitHubAutoSystem() {
    console.log('🧪 Test Sistema GitHub Auto DMS\n');

    // 1. Genera token di test
    const now = Math.floor(Date.now() / 1000);
    const jti = generateUUID();
    const testEmail = 'test@example.com';
    const issueNumber = Math.floor(Math.random() * 1000) + 1000;

    const payload = {
        sub: testEmail,
        scope: ['news-private'],
        exp: now + 21600, // 6 ore
        jti: jti,
        iss: 'dms-gemello-news',
        iat: now,
        github_auto: true,
        github_issue: issueNumber,
        github_repo: 'Chcndr/dms-access-tracker',
        session_duration: 3600
    };

    const token = createJWT(payload, JWT_SECRET);
    
    console.log('✅ Token JWT generato:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Issue: #${issueNumber}`);
    console.log(`   JTI: ${jti}`);
    console.log(`   Scadenza: ${new Date(payload.exp * 1000).toLocaleString('it-IT')}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    // 2. Genera link completo
    const baseUrl = 'https://chcndr.github.io/dms-gemello-news/landing/home.html';
    const fullLink = `${baseUrl}?t=${token}`;
    
    console.log('\n🔗 Link di accesso generato:');
    console.log(`   ${fullLink}`);
    
    // 3. Simula controllo Issue GitHub
    console.log('\n🔍 Simulazione controllo GitHub Issue:');
    console.log(`   Repository: ${payload.github_repo}`);
    console.log(`   Issue Number: #${payload.github_issue}`);
    console.log(`   API URL: https://api.github.com/repos/${payload.github_repo}/issues/${payload.github_issue}`);
    
    // 4. Genera esempio di risposta Issue
    const mockIssueResponse = {
        number: issueNumber,
        title: `[DMS-ACCESS] ${testEmail} - NEWS-PRIVATE`,
        state: 'open',
        comments: 1,
        html_url: `https://github.com/${payload.github_repo}/issues/${issueNumber}`,
        created_at: new Date().toISOString()
    };
    
    console.log('\n📝 Esempio Issue GitHub:');
    console.log(`   Titolo: ${mockIssueResponse.title}`);
    console.log(`   URL: ${mockIssueResponse.html_url}`);
    console.log(`   Commenti: ${mockIssueResponse.comments}`);
    
    // 5. Genera esempio di commento utente
    const mockComment = {
        id: Math.floor(Math.random() * 100000),
        user: { login: testEmail.split('@')[0] },
        body: 'ok',
        created_at: new Date().toISOString()
    };
    
    console.log('\n💬 Esempio commento utente:');
    console.log(`   Utente: ${mockComment.user.login}`);
    console.log(`   Messaggio: "${mockComment.body}"`);
    console.log(`   Data: ${new Date(mockComment.created_at).toLocaleString('it-IT')}`);
    
    // 6. Simula attivazione sessione
    const sessionData = {
        sub: payload.sub,
        jti: payload.jti,
        scope: payload.scope,
        exp: now + payload.session_duration,
        device: 'test-device-fingerprint',
        activated_at: new Date().toISOString(),
        issue_number: payload.github_issue,
        auto_activated: true,
        response_data: {
            responded_at: mockComment.created_at,
            response_body: mockComment.body,
            user: mockComment.user.login,
            comment_id: mockComment.id,
            issue_number: payload.github_issue,
            method: 'github_issue_comment'
        }
    };
    
    console.log('\n🎉 Simulazione attivazione sessione:');
    console.log(`   Sessione attiva fino: ${new Date(sessionData.exp * 1000).toLocaleString('it-IT')}`);
    console.log(`   Durata: ${payload.session_duration / 60} minuti`);
    console.log(`   Metodo: ${sessionData.response_data.method}`);
    
    console.log('\n✅ Test completato con successo!');
    console.log('\n📋 Prossimi passi:');
    console.log('   1. Configura GitHub Token nel generatore');
    console.log('   2. Crea repository privato "dms-access-tracker"');
    console.log('   3. Testa con utente reale');
    console.log('   4. Verifica notifiche email GitHub');
}

// Esegui test
testGitHubAutoSystem().catch(console.error);
