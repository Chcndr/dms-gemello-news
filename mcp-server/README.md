# DMS MCP Connector

MCP (Model Context Protocol) Connector per automazione GitHub del progetto DMS.

## 🚀 Quick Start

### 1. Preparazione

```bash
# Copia il file environment
cp .env.example .env

# Modifica le variabili
nano .env
```

### 2. Secrets Setup

```bash
# Crea cartella secrets
mkdir -p secrets

# Copia la private key della GitHub App
cp /path/to/github-app-private-key.pem secrets/github_app.pem
chmod 600 secrets/github_app.pem
```

### 3. Deploy

```bash
# Build e avvio
docker-compose up -d

# Verifica status
docker-compose ps
curl http://localhost:8080/health
```

## 🔧 Configurazione

### Variabili Environment

| Variabile | Descrizione | Esempio |
|-----------|-------------|---------|
| `MCP_SECRET` | Token per autenticazione API | `your-secret-token` |
| `GITHUB_APP_ID` | ID della GitHub App | `123456` |
| `GITHUB_INSTALLATION_ID` | ID installazione | `789012` |
| `GITHUB_PRIVATE_KEY_PATH` | Path chiave privata | `/secrets/github_app.pem` |
| `REPO_OWNER` | Owner repository | `Chcndr` |
| `REPO_NAME` | Nome repository | `dms-gemello-news` |

### GitHub App Permissions

La GitHub App deve avere questi permessi:

- **Contents**: Read & Write
- **Pull requests**: Read & Write  
- **Actions**: Read & Write
- **Metadata**: Read
- **Issues**: Read
- **Commit statuses**: Read & Write

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Create Branch and Commit
```bash
POST /actions/create-branch-and-commit
Authorization: Bearer YOUR_MCP_SECRET

{
  "branch_name": "feature/new-feature",
  "commit_message": "Add new feature",
  "base_branch": "main",
  "files": [
    {
      "path": "README.md",
      "content": "# Updated README"
    }
  ]
}
```

### Open Pull Request
```bash
POST /actions/open-pr
Authorization: Bearer YOUR_MCP_SECRET

{
  "title": "Add new feature",
  "body": "Description of changes",
  "head_branch": "feature/new-feature",
  "base_branch": "main",
  "draft": false
}
```

### Merge Pull Request
```bash
POST /actions/merge-pr
Authorization: Bearer YOUR_MCP_SECRET

{
  "pr_number": 123,
  "commit_title": "Merge feature",
  "commit_message": "Merge new feature into main",
  "merge_method": "merge"
}
```

## 🔒 Sicurezza

- **Rate Limiting**: 100 richieste per IP ogni 15 minuti
- **CORS**: Configurato per domini autorizzati
- **Helmet**: Headers di sicurezza automatici
- **Token Auth**: Tutte le API richiedono token MCP_SECRET
- **HTTPS**: Nginx con SSL/TLS

## 📊 Monitoring

### Logs
```bash
# Logs applicazione
docker-compose logs -f mcp-server

# Logs Nginx
docker-compose logs -f nginx
```

### Health Check
```bash
curl https://dms-mcp-connector.manus.space/health
```

### Metriche
- Response time
- Error rate  
- Request volume
- GitHub API rate limits

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Docker Build
```bash
# Build image
npm run build

# Run locally
docker run -p 8080:8080 --env-file .env dms/mcp-connector
```

## 🚨 Troubleshooting

### Common Issues

1. **GitHub App Authentication Failed**
   - Verifica GITHUB_APP_ID e INSTALLATION_ID
   - Controlla che la private key sia corretta
   - Verifica permessi della GitHub App

2. **Rate Limiting**
   - GitHub API: 5000 richieste/ora per app
   - Nginx: 10 richieste/secondo per IP

3. **SSL Certificate Issues**
   - Verifica certificati in `ssl/`
   - Controlla configurazione Nginx

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
docker-compose restart mcp-server
```

## 📝 Changelog

### v1.0.0
- ✅ GitHub App authentication
- ✅ Create branch and commit
- ✅ Open pull request
- ✅ Merge pull request
- ✅ Rate limiting e sicurezza
- ✅ Docker deployment
- ✅ HTTPS con Nginx

## 📄 License

MIT License - vedi LICENSE file per dettagli.

