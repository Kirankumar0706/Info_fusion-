import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Node.js 20 compatibility polyfill for Supabase Realtime client
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocket {};
}

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local and .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const envVars = {};

  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!envVars[key]) {
              envVars[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`Could not read ${file}:`, err.message);
      }
    }
  }
  return envVars;
}

const env = loadEnv();
const supabaseUrl = (process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://ysotsjbcoovxbqpshmat.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb3RzamJjb292eGJxcHNobWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0OTAwODAsImV4cCI6MjEwNzA2NjA4MH0.roBQV9ZPX8wQPb28v4nzes_JBvDpSIenihD5xZGLtmI').trim();

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const PORT = process.env.PORT || 5000;

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  });
  res.end(JSON.stringify(data));
}

// Helper: read request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. Health check endpoint
    if (pathname === '/api/health' && req.method === 'GET') {
      let authHealthy = false;
      try {
        const check = await fetch(`${supabaseUrl}/auth/v1/health`, {
          headers: { apikey: supabaseAnonKey }
        });
        authHealthy = check.ok;
      } catch {
        authHealthy = false;
      }

      return sendJson(res, 200, {
        status: 'healthy',
        service: 'InfoFusion Backend Server',
        timestamp: new Date().toISOString(),
        supabase: {
          url: supabaseUrl,
          connected: authHealthy,
          authService: authHealthy ? 'online' : 'offline',
        }
      });
    }

    // 2. Comprehensive Status Endpoint
    if (pathname === '/api/status' && req.method === 'GET') {
      let tablesStatus = { workspaces: false, organizations: false, documents: false };
      try {
        const { error: wsErr } = await supabase.from('workspaces').select('id').limit(1);
        tablesStatus.workspaces = !wsErr || wsErr.code === '42501';

        const { error: orgErr } = await supabase.from('organizations').select('id').limit(1);
        tablesStatus.organizations = !orgErr || orgErr.code === '42501';

        const { error: docErr } = await supabase.from('documents').select('id').limit(1);
        tablesStatus.documents = !docErr || docErr.code === '42501';
      } catch (e) {
        console.warn('Status check warning:', e.message);
      }

      return sendJson(res, 200, {
        backendServer: 'online',
        port: PORT,
        supabaseUrl,
        tables: tablesStatus,
        mode: 'connected'
      });
    }

    // 3. Workspaces API
    if (pathname === '/api/workspaces' && req.method === 'GET') {
      const orgId = url.searchParams.get('org_id');
      let query = supabase.from('workspaces').select('*').order('created_at', { ascending: false });
      if (orgId) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error) {
        return sendJson(res, 200, { source: 'supabase_fallback', data: [], message: error.message });
      }
      return sendJson(res, 200, { source: 'supabase', data: data || [] });
    }

    if (pathname === '/api/workspaces' && req.method === 'POST') {
      const body = await parseBody(req);
      const { data, error } = await supabase.from('workspaces').insert({
        id: body.id,
        name: body.name,
        organization_id: body.organization_id,
        description: body.description,
        industry: body.industry,
        use_case: body.use_case,
        status: body.status || 'active',
      }).select().single();

      if (error) {
        return sendJson(res, 400, { error: error.message });
      }
      return sendJson(res, 201, { data });
    }

    // 4. Default 404 for unknown routes
    return sendJson(res, 404, { error: 'Not Found', path: pathname });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('========================================================');
  console.log(`🚀 InfoFusion Backend Server is running!`);
  console.log(`📡 Local API: http://127.0.0.1:${PORT}`);
  console.log(`⚡ Supabase:  ${supabaseUrl}`);
  console.log(`✨ Health:    http://127.0.0.1:${PORT}/api/health`);
  console.log('========================================================');
});
