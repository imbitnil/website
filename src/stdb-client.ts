import { DbConnection, tables, type SubscriptionEventContext } from './module_bindings';

// SpaceTimeDB connection config
const SPACETIMEDB_URI = 'wss://maincloud.spacetimedb.com';
const DATABASE_NAME = 'server-fpea2';

interface BlogPost {
  id: bigint;
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string;
}

let conn: DbConnection | null = null;
let blogPostsCache: BlogPost[] = [];
let onPostsUpdated: ((posts: BlogPost[]) => void) | null = null;

function refreshPostsFromCache(ctx: { db: any }) {
  const posts: BlogPost[] = [];
  for (const row of ctx.db.blog_post.iter()) {
    posts.push({
      id: row.id,
      title: row.title,
      category: row.category,
      date: row.date,
      summary: row.summary,
      body: row.body,
    });
  }
  blogPostsCache = posts;
  if (onPostsUpdated) onPostsUpdated(posts);
}

let hasRetried = false;

function buildConnection(callback: (posts: BlogPost[]) => void, token?: string) {
  conn = DbConnection.builder()
    .withUri(SPACETIMEDB_URI)
    .withDatabaseName(DATABASE_NAME)
    .withToken(token)
    .onConnect((ctx, identity, newToken) => {
      console.log('[SpaceTimeDB] Connected as', identity.toHexString());
      localStorage.setItem('stdb_portfolio_token', newToken);

      conn!.subscriptionBuilder()
        .onApplied((subCtx: SubscriptionEventContext) => {
          console.log('[SpaceTimeDB] Subscription applied, loading posts...');
          refreshPostsFromCache(subCtx);
        })
        .subscribe('SELECT * FROM blog_post');
    })
    .onDisconnect((_ctx, error) => {
      console.log('[SpaceTimeDB] Disconnected', error || '');
    })
    .onConnectError((_ctx, err) => {
      console.error('[SpaceTimeDB] Connection error:', err);
      // If we have a stored token and haven't retried, clear it and try fresh
      if (!hasRetried && localStorage.getItem('stdb_portfolio_token')) {
        hasRetried = true;
        console.log('[SpaceTimeDB] Retrying with fresh token...');
        localStorage.removeItem('stdb_portfolio_token');
        conn = null;
        buildConnection(callback, undefined);
      }
    })
    .build();

  // Listen for real-time changes
  conn.db.blog_post.onInsert((ctx) => {
    refreshPostsFromCache(ctx);
  });
  conn.db.blog_post.onDelete((ctx) => {
    refreshPostsFromCache(ctx);
  });
  conn.db.blog_post.onUpdate((ctx) => {
    refreshPostsFromCache(ctx);
  });
}

export function connect(callback: (posts: BlogPost[]) => void) {
  onPostsUpdated = callback;
  hasRetried = false;
  const token = localStorage.getItem('stdb_portfolio_token') || undefined;
  buildConnection(callback, token);
}

export function getPosts(): BlogPost[] {
  return blogPostsCache;
}

export function addPost(title: string, category: string, date: string, summary: string, body: string) {
  if (!conn) return;
  conn.reducers.addBlogPost({ title, category, date, summary, body });
}

export function updatePost(id: bigint, title: string, category: string, date: string, summary: string, body: string) {
  if (!conn) return;
  conn.reducers.updateBlogPost({ id, title, category, date, summary, body });
}

export function deletePost(id: bigint) {
  if (!conn) return;
  conn.reducers.deleteBlogPost({ id });
}
