// Script minimale per aggiungere solo il link privacy
// Non tocca nulla dell'interfaccia esistente
(function() {
  'use strict';
  
  // Aspetta che il DOM sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPrivacyLink);
  } else {
    addPrivacyLink();
  }
  
  function addPrivacyLink() {
    // Controlla se il link esiste già
    if (document.getElementById('privacy-link')) return;
    
    // Crea il link privacy
    const privacyLink = document.createElement('a');
    privacyLink.id = 'privacy-link';
    privacyLink.href = '/dms-gemello-news/privacy.html';
    privacyLink.textContent = 'Informativa Privacy';
    privacyLink.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: 10;
      text-decoration: underline;
      opacity: 0.85;
      color: #9bd6de;
      font-size: 14px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    `;
    
    // Aggiunge il link al body
    document.body.appendChild(privacyLink);
  }
})();
