/*
 * Configurazione GitHub per DMS Auto System
 * Questo file contiene la configurazione per il sistema automatico
 */

// Configurazione GitHub (da aggiornare con token reale)
window.DMS_GITHUB_CONFIG = {
    token: 'ghp_INSERISCI_QUI_IL_TUO_TOKEN',
    owner: 'Chcndr',
    repo: 'dms-access-tracker'
};

// Auto-popolamento del form se configurazione presente
document.addEventListener('DOMContentLoaded', function() {
    if (window.DMS_GITHUB_CONFIG && window.DMS_GITHUB_CONFIG.token) {
        const tokenField = document.getElementById('githubToken');
        const repoField = document.getElementById('githubRepo');
        
        if (tokenField && window.DMS_GITHUB_CONFIG.token !== 'ghp_PLACEHOLDER') {
            tokenField.value = window.DMS_GITHUB_CONFIG.token;
        }
        
        if (repoField) {
            repoField.value = `${window.DMS_GITHUB_CONFIG.owner}/${window.DMS_GITHUB_CONFIG.repo}`;
        }
    }
});
