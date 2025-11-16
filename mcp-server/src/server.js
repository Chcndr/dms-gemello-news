const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dms-mcp-connector' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://chcndr.github.io'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (token !== process.env.MCP_SECRET) {
    return res.status(403).json({ error: 'Invalid access token' });
  }

  next();
};

// Initialize GitHub App authentication
let octokit;
try {
  const privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8');
  
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    installationId: process.env.GITHUB_INSTALLATION_ID,
  });

  octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: privateKey,
      installationId: process.env.GITHUB_INSTALLATION_ID,
    },
  });

  logger.info('GitHub App authentication initialized');
} catch (error) {
  logger.error('Failed to initialize GitHub App authentication:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    github_connected: !!octokit
  });
});

// GitHub webhook endpoint
app.post('/github-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const event = req.headers['x-github-event'];
  const signature = req.headers['x-hub-signature-256'];
  
  logger.info(`Received GitHub webhook: ${event}`);
  
  // TODO: Verify webhook signature
  // TODO: Process webhook events
  
  res.status(200).json({ received: true });
});

// MCP Actions

// 1. Create branch and commit
app.post('/actions/create-branch-and-commit', authenticateToken, async (req, res) => {
  try {
    const { branch_name, commit_message, files, base_branch = 'main' } = req.body;

    if (!branch_name || !commit_message || !files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Missing required fields: branch_name, commit_message, files' 
      });
    }

    logger.info(`Creating branch: ${branch_name}`);

    // Get base branch reference
    const { data: baseRef } = await octokit.rest.git.getRef({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      ref: `heads/${base_branch}`,
    });

    // Create new branch
    await octokit.rest.git.createRef({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      ref: `refs/heads/${branch_name}`,
      sha: baseRef.object.sha,
    });

    // Create blobs for each file
    const blobs = [];
    for (const file of files) {
      const { data: blob } = await octokit.rest.git.createBlob({
        owner: process.env.REPO_OWNER,
        repo: process.env.REPO_NAME,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });
      blobs.push({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' });
    }

    // Create tree
    const { data: tree } = await octokit.rest.git.createTree({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      base_tree: baseRef.object.sha,
      tree: blobs,
    });

    // Create commit
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      message: commit_message,
      tree: tree.sha,
      parents: [baseRef.object.sha],
    });

    // Update branch reference
    await octokit.rest.git.updateRef({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      ref: `heads/${branch_name}`,
      sha: commit.sha,
    });

    logger.info(`Branch created successfully: ${branch_name}`);

    res.json({
      success: true,
      branch_name,
      commit_sha: commit.sha,
      commit_url: commit.html_url
    });

  } catch (error) {
    logger.error('Error creating branch and commit:', error);
    res.status(500).json({ 
      error: 'Failed to create branch and commit',
      details: error.message 
    });
  }
});

// 2. Open pull request
app.post('/actions/open-pr', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      body, 
      head_branch, 
      base_branch = 'main',
      draft = false 
    } = req.body;

    if (!title || !head_branch) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, head_branch' 
      });
    }

    logger.info(`Opening PR: ${title}`);

    const { data: pr } = await octokit.rest.pulls.create({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      title,
      body: body || '',
      head: head_branch,
      base: base_branch,
      draft
    });

    logger.info(`PR opened successfully: #${pr.number}`);

    res.json({
      success: true,
      pr_number: pr.number,
      pr_url: pr.html_url,
      pr_id: pr.id
    });

  } catch (error) {
    logger.error('Error opening PR:', error);
    res.status(500).json({ 
      error: 'Failed to open pull request',
      details: error.message 
    });
  }
});

// 3. Merge pull request
app.post('/actions/merge-pr', authenticateToken, async (req, res) => {
  try {
    const { 
      pr_number, 
      commit_title, 
      commit_message,
      merge_method = 'merge' // merge, squash, rebase
    } = req.body;

    if (!pr_number) {
      return res.status(400).json({ 
        error: 'Missing required field: pr_number' 
      });
    }

    logger.info(`Merging PR: #${pr_number}`);

    const { data: merge } = await octokit.rest.pulls.merge({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      pull_number: pr_number,
      commit_title,
      commit_message,
      merge_method
    });

    logger.info(`PR merged successfully: #${pr_number}`);

    res.json({
      success: true,
      merged: merge.merged,
      merge_commit_sha: merge.sha,
      message: merge.message
    });

  } catch (error) {
    logger.error('Error merging PR:', error);
    res.status(500).json({ 
      error: 'Failed to merge pull request',
      details: error.message 
    });
  }
});

// Get repository info
app.get('/repo/info', authenticateToken, async (req, res) => {
  try {
    const { data: repo } = await octokit.rest.repos.get({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
    });

    res.json({
      name: repo.name,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      private: repo.private,
      html_url: repo.html_url
    });
  } catch (error) {
    logger.error('Error getting repo info:', error);
    res.status(500).json({ 
      error: 'Failed to get repository info',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`DMS MCP Connector running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Repository: ${process.env.REPO_OWNER}/${process.env.REPO_NAME}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

