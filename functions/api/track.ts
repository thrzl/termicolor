/**
 * Share tracking API endpoint.
 *
 * Tracks share events using Cloudflare KV storage.
 * POST /api/track - Increment share count for a platform
 * GET /api/track - Get current share counts
 */

interface Env {
  SHARE_STATS: KVNamespace;
}

interface TrackRequest {
  platform: 'twitter' | 'reddit' | 'copy' | 'native';
}

interface ShareStats {
  twitter: number;
  reddit: number;
  copy: number;
  native: number;
  total: number;
  lastUpdated: string;
}

const STATS_KEY = 'share_stats';

/**
 * Get current share statistics.
 */
async function getStats(kv: KVNamespace): Promise<ShareStats> {
  const data = await kv.get(STATS_KEY, 'json');
  if (data) {
    return data as ShareStats;
  }
  return {
    twitter: 0,
    reddit: 0,
    copy: 0,
    native: 0,
    total: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Handle POST request to track a share event.
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as TrackRequest;
    const { platform } = body;

    if (!platform || !['twitter', 'reddit', 'copy', 'native'].includes(platform)) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stats = await getStats(env.SHARE_STATS);
    stats[platform]++;
    stats.total++;
    stats.lastUpdated = new Date().toISOString();

    await env.SHARE_STATS.put(STATS_KEY, JSON.stringify(stats));

    return new Response(
      JSON.stringify({ success: true, platform, total: stats.total }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle GET request to retrieve share statistics.
 */
async function handleGet(env: Env): Promise<Response> {
  const stats = await getStats(env.SHARE_STATS);
  return new Response(
    JSON.stringify(stats),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Main request handler.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let response: Response;

  if (request.method === 'POST') {
    response = await handlePost(request, env);
  } else if (request.method === 'GET') {
    response = await handleGet(env);
  } else {
    response = new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Add CORS headers to response
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
};
