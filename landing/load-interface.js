// Script per caricare l'interfaccia dell'orologio quando l'auth è disattivato
(function() {
  'use strict';
  
  // Aspetta che il DOM sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInterface);
  } else {
    loadInterface();
  }
  
  function loadInterface() {
    // Carica l'interfaccia dell'orologio direttamente
    window.location.href = '/dms-gemello-news/landing/home-v2.html';
  }
})();
