/*
 * Sistema Link Corti DMS - Versione Semplificata
 */

// Genera ID corto da JWT
function generateShortId(jwtToken) {
    const payload = jwtToken.split('.')[1];
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
        hash = ((hash << 5) - hash) + payload.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
}

// Crea link corto
window.createShortLink = function(longUrl, jwtToken, userEmail) {
    const shortId = generateShortId(jwtToken);
    const shortUrl = `https://chcndr.github.io/dms-gemello-news/redirect.html?s=${shortId}`;
    
    // Salva mapping
    const linkData = {
        shortId: shortId,
        longUrl: longUrl,
        userEmail: userEmail,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`dms_short_${shortId}`, JSON.stringify(linkData));
    
    return {
        shortUrl: shortUrl,
        shortId: shortId,
        originalUrl: longUrl,
        savings: longUrl.length - shortUrl.length
    };
};
