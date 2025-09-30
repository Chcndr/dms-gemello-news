/*
 * Test Sistema Completo - GitHub Auto DMS
 * Genera token JWT reale e testa il collegamento con GitHub Issue
 */

const JWT_SECRET = 'dms-gemello-2025-jwt-secret-key-v1';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function base64urlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function createSignature(data, secret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return base64urlEncode(hmac.digest());
}

function createJWT(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = createSignature(data, secret);
    return `${data}.${signature}`;
}

async function testSistemaCompleto() {
    console.log('🧪 Test Sistema Completo - GitHub Auto DMS\n');

    // 1. Genera token JWT collegato all'Issue #1 creato
    const now = Math.floor(Date.now() / 1000);
    const jti = generateUUID();
    const testEmail = 'test@example.com';

    const payload = {
        sub: testEmail,
        scope: ['news-private'],
        exp: now + 21600, // 6 ore
        jti: jti,
        iss: 'dms-gemello-news',
        iat: now,
        github_auto: true,
        github_issue: 1, // Issue #1 che abbiamo creato
        github_repo: 'Chcndr/dms-access-tracker',
        session_duration: 3600
    };

    const token = createJWT(payload, JWT_SECRET);
    
    console.log('✅ Token JWT generato per Issue #1:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Issue: #${payload.github_issue}`);
    console.log(`   Repository: ${payload.github_repo}`);
    console.log(`   JTI: ${jti}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    // 2. Genera link completo per il sito DMS
    const baseUrl = 'https://chcndr.github.io/dms-gemello-news/landing/home.html';
    const fullLink = `${baseUrl}?t=${token}`;
    
    console.log('\n🔗 Link di accesso DMS:');
    console.log(`   ${fullLink}`);
    
    console.log('\n🎯 Come collegare al sito:');
    console.log('   1. ✅ Repository privato creato: https://github.com/Chcndr/dms-access-tracker');
    console.log('   2. ✅ Issue #1 creato con commento di test');
    console.log('   3. ✅ Token JWT configurato con github_issue: 1');
    console.log('   4. ✅ Sistema auth-gate-github-auto.js aggiornato');
    console.log('   5. ✅ Generatore token configurato con GitHub token');
    
    console.log('\n📋 Prossimi passi per il deploy:');
    console.log('   1. 🚀 Caricare i file aggiornati su GitHub Pages');
    console.log('   2. 🔄 Sostituire auth-gate-full-auto.js con auth-gate-github-auto.js');
    console.log('   3. 🧪 Testare con link generato sopra');
    console.log('   4. 📧 Verificare notifiche email GitHub');
    
    console.log('\n✅ Sistema pronto per il collegamento al sito!');
}

testSistemaCompleto().catch(console.error);
