/**
 * Authentication endpoints for user registration and API token management
 */

import express from 'express';
import { Database } from './database';

const router = express.Router();
const db = new Database();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = db.createUser(email, password);
    
    // Generate initial API token
    const apiToken = db.generateApiToken(user.id, 'Initial Token');

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      apiToken
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!db.verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate new session token (in production, use JWT)
    const sessionToken = 'sess_' + require('crypto').randomBytes(32).toString('hex');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      sessionToken
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Generate new API token
router.post('/token', async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const apiToken = db.generateApiToken(userId, name || 'API Token');

    res.json({
      success: true,
      token: apiToken
    });
  } catch (error) {
    console.error('[Auth] Token generation error:', error);
    res.status(500).json({ error: 'Token generation failed' });
  }
});

// Get user's API tokens
router.get('/tokens/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tokens = db.getUserTokens(userId);

    res.json({
      success: true,
      tokens: tokens.map(t => ({
        name: t.name,
        token: t.token.substring(0, 12) + '...', // Show partial token
        fullToken: t.token, // Include full token for dashboard use
        createdAt: t.createdAt,
        lastUsed: t.lastUsed
      }))
    });
  } catch (error) {
    console.error('[Auth] Get tokens error:', error);
    res.status(500).json({ error: 'Failed to retrieve tokens' });
  }
});

// Delete API token
router.delete('/token', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token required' });
    }

    const deleted = db.deleteToken(userId, token);

    if (!deleted) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Auth] Delete token error:', error);
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

// Validate API token (for SDK use)
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const user = db.validateApiToken(token);

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth] Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

export default router;