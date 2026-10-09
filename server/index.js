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

// UUID validation helper
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUUID(val) {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

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
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();

// Base public client (anon role)
const baseSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

/**
 * Returns a user-scoped Supabase client when an Authorization header is present,
 * ensuring PostgREST evaluates Row Level Security (RLS) under the user's identity.
 */
function getSupabaseClient(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  return baseSupabase;
}

/**
 * Verifies the incoming Bearer token and returns the authenticated user object.
 * Returns null if token is missing or invalid.
 */
async function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const { data: { user }, error } = await baseSupabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

const PORT = process.env.PORT || 5000;

// Helper: send JSON response with CORS headers
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

const distDir = path.join(rootDir, 'dist');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

function tryServeStatic(res, pathname) {
  if (!fs.existsSync(distDir)) return false;

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(distDir, safePath === '/' || safePath === '\\' ? 'index.html' : safePath);

  // Prevent directory traversal
  if (!filePath.startsWith(distDir)) return false;

  // Serve static asset file if it exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  // SPA navigation fallback: serve index.html for application routes
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(indexPath).pipe(res);
    return true;
  }

  return false;
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

  // If request is not for the backend API, serve the frontend application
  if (!pathname.startsWith('/api')) {
    const served = tryServeStatic(res, pathname);
    if (served) return;
    // Fallback: redirect to Vite dev server if dist not ready
    res.writeHead(302, { 'Location': `http://127.0.0.1:5173${url.pathname}${url.search}` });
    res.end();
    return;
  }

  const client = getSupabaseClient(req);

  try {
    // =========================================================================
    // 1. Health check endpoint
    // =========================================================================
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

    // =========================================================================
    // 2. Auth verification endpoint
    // =========================================================================
    if (pathname === '/api/auth/verify' && req.method === 'POST') {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return sendJson(res, 401, {
          authenticated: false,
          error: 'Invalid or missing Bearer token'
        });
      }
      return sendJson(res, 200, {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      });
    }

    // =========================================================================
    // 3. Database Schema Status & Integrity Check
    // =========================================================================
    if (pathname === '/api/database-status' && req.method === 'GET') {
      const requiredTables = [
        'organizations',
        'organization_members',
        'profiles',
        'workspaces',
        'documents',
        'document_chunks',
        'facts',
        'evidence',
        'contradictions',
        'evidence_gaps',
        'findings',
        'decisions',
        'actions',
        'reports',
        'activity_logs'
      ];

      const tableReport = {};
      for (const table of requiredTables) {
        try {
          const resProbe = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            }
          });
          const data = await resProbe.json();

          if (resProbe.ok) {
            tableReport[table] = { status: 'accessible', httpStatus: resProbe.status };
          } else if (data.code === '42501') {
            tableReport[table] = { status: 'exists_permission_denied', code: '42501', hint: data.hint || 'Table exists in PostgreSQL; requires GRANT or RLS authentication' };
          } else if (data.code === 'PGRST205') {
            tableReport[table] = { status: 'missing_from_schema_cache', code: 'PGRST205', error: data.message };
          } else {
            tableReport[table] = { status: 'error', httpStatus: resProbe.status, code: data.code, error: data.message };
          }
        } catch (err) {
          tableReport[table] = { status: 'network_error', error: err.message };
        }
      }

      const accessibleCount = Object.values(tableReport).filter(t => t.status === 'accessible').length;
      const permissionDeniedCount = Object.values(tableReport).filter(t => t.status === 'exists_permission_denied').length;
      const existingCount = Object.values(tableReport).filter(t => t.status === 'accessible' || t.status === 'exists_permission_denied').length;
      const missingCount = Object.values(tableReport).filter(t => t.status === 'missing_from_schema_cache').length;

      return sendJson(res, 200, {
        supabaseUrl,
        allTablesCreated: missingCount === 0,
        existingCount,
        accessibleCount,
        permissionDeniedCount,
        missingCount,
        totalChecked: requiredTables.length,
        status: accessibleCount === requiredTables.length ? 'ALL_ACCESSIBLE' : (permissionDeniedCount > 0 ? 'NEEDS_POSTGREST_GRANT' : 'MISSING_TABLES'),
        quickFixSql: permissionDeniedCount > 0 
          ? "GRANT USAGE ON SCHEMA public TO anon, authenticated; GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;"
          : null,
        tables: tableReport,
      });
    }

    // =========================================================================
    // 4. Workspaces API
    // =========================================================================
    if (pathname === '/api/workspaces' && req.method === 'GET') {
      const orgId = url.searchParams.get('org_id');
      let query = client.from('workspaces').select('*').order('created_at', { ascending: false });
      if (orgId && isUUID(orgId)) {
        query = query.eq('organization_id', orgId);
      }

      const { data, error } = await query;
      if (error) {
        return sendJson(res, 200, {
          source: 'supabase',
          status: 'error',
          code: error.code,
          message: error.message,
          data: []
        });
      }
      return sendJson(res, 200, { source: 'supabase', status: 'success', data: data || [] });
    }

    if (pathname === '/api/workspaces' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.name || typeof body.name !== 'string') {
        return sendJson(res, 400, { error: 'Workspace name is required' });
      }

      const authUser = await getAuthenticatedUser(req);
      const creatorId = authUser?.id || (isUUID(body.created_by) ? body.created_by : null);

      // 1. Try full schema payload first
      const fullPayload = {
        name: body.name.trim(),
        description: body.description || '',
        industry: body.industry || null,
        use_case: body.use_case || null,
        status: body.status || 'active',
      };
      if (isUUID(body.id)) fullPayload.id = body.id;
      if (isUUID(body.organization_id)) fullPayload.organization_id = body.organization_id;
      if (creatorId) fullPayload.created_by = creatorId;

      let insertRes = await client.from('workspaces').insert(fullPayload).select().single();

      // 2. If 'description' or another column is missing in remote table (PGRST204),
      // adapt automatically to the remote table's verified column set
      if (insertRes.error && insertRes.error.code === 'PGRST204') {
        const minimalPayload = {
          name: body.name.trim(),
        };
        if (isUUID(body.id)) minimalPayload.id = body.id;
        if (isUUID(body.organization_id)) minimalPayload.organization_id = body.organization_id;
        if (creatorId) minimalPayload.created_by = creatorId;

        insertRes = await client.from('workspaces').insert(minimalPayload).select().single();
      }

      if (insertRes.error) {
        return sendJson(res, 400, {
          error: insertRes.error.message,
          code: insertRes.error.code,
          hint: insertRes.error.hint || null,
          details: insertRes.error.details || null
        });
      }

      return sendJson(res, 201, { data: insertRes.data });
    }

    // Delete workspace endpoint
    if (pathname.startsWith('/api/workspaces/') && req.method === 'DELETE') {
      const wsId = pathname.slice('/api/workspaces/'.length);
      if (!isUUID(wsId)) {
        return sendJson(res, 400, { error: 'Invalid workspace UUID' });
      }

      const { error } = await client.from('workspaces').delete().eq('id', wsId);
      if (error) {
        return sendJson(res, 400, { error: error.message, code: error.code });
      }
      return sendJson(res, 200, { success: true, deletedId: wsId });
    }

    // =========================================================================
    // 5. Protected Documents API
    // =========================================================================
    if (pathname === '/api/documents' && req.method === 'GET') {
      const wsId = url.searchParams.get('workspace_id');
      if (!wsId || !isUUID(wsId)) {
        return sendJson(res, 400, { error: 'Valid workspace_id is required' });
      }

      const { data, error } = await client
        .from('documents')
        .select('*')
        .eq('workspace_id', wsId)
        .order('created_at', { ascending: false });

      if (error) {
        return sendJson(res, 200, {
          source: 'supabase',
          status: 'error',
          code: error.code,
          message: error.message,
          data: []
        });
      }
      return sendJson(res, 200, { source: 'supabase', status: 'success', data: data || [] });
    }

    // =========================================================================
    // 6. Default 404 for unknown routes
    // =========================================================================
    return sendJson(res, 404, { error: 'Not Found', path: pathname });
  } catch (err) {
    console.error('API Server Error:', err.message);
    return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use; server is already running.`);
  } else {
    console.error('Server error:', e);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('========================================================');
  console.log(`🚀 InfoFusion Backend Server is running!`);
  console.log(`📡 Local API:     http://127.0.0.1:${PORT}`);
  console.log(`⚡ Supabase:      ${supabaseUrl}`);
  console.log(`✨ Health:        http://127.0.0.1:${PORT}/api/health`);
  console.log(`📊 DB Status:     http://127.0.0.1:${PORT}/api/database-status`);
  console.log('========================================================');
});
