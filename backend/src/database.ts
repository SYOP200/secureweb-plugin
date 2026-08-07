/**
 * Simple in-memory database for user management
 * In production, replace with PostgreSQL, MongoDB, etc.
 */

import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  apiTokens: ApiToken[];
  createdAt: number;
}

interface ApiToken {
  token: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
}

export class Database {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();

  // User management
  createUser(email: string, password: string): User {
    const id = crypto.randomUUID();
    const passwordHash = this.hashPassword(password);
    
    const user: User = {
      id,
      email,
      passwordHash,
      apiTokens: [],
      createdAt: Date.now()
    };

    this.users.set(id, user);
    this.emailToId.set(email.toLowerCase(), id);
    
    return user;
  }

  getUserByEmail(email: string): User | undefined {
    const id = this.emailToId.get(email.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  verifyPassword(user: User, password: string): boolean {
    return user.passwordHash === this.hashPassword(password);
  }

  private hashPassword(password: string): string {
    // Simple hash for demo - use bcrypt in production
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // API Token management
  generateApiToken(userId: string, name: string = 'Default Token'): string {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const token = 'sw_' + crypto.randomBytes(32).toString('hex');
    
    const apiToken: ApiToken = {
      token,
      name,
      createdAt: Date.now()
    };

    user.apiTokens.push(apiToken);
    return token;
  }

  validateApiToken(token: string): User | undefined {
    for (const user of this.users.values()) {
      const validToken = user.apiTokens.find(t => t.token === token);
      if (validToken) {
        validToken.lastUsed = Date.now();
        return user;
      }
    }
    return undefined;
  }

  getUserTokens(userId: string): ApiToken[] {
    const user = this.users.get(userId);
    return user?.apiTokens || [];
  }

  deleteToken(userId: string, token: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const index = user.apiTokens.findIndex(t => t.token === token);
    if (index === -1) return false;

    user.apiTokens.splice(index, 1);
    return true;
  }

  // Analytics
  getUserCount(): number {
    return this.users.size;
  }

  getTotalTokens(): number {
    let total = 0;
    for (const user of this.users.values()) {
      total += user.apiTokens.length;
    }
    return total;
  }
}