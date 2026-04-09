import { schema, table, t, SenderError } from 'spacetimedb/server';

const spacetimedb = schema({
  blog_post: table(
    {
      public: true,
      indexes: [
        { name: 'blog_post_category', algorithm: 'btree', columns: ['category'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      title: t.string(),
      category: t.string(),
      date: t.string(),
      summary: t.string(),
      body: t.string(),
      createdAt: t.timestamp(),
    }
  ),
  admin: table(
    { public: false },
    {
      identity: t.identity().primaryKey(),
    }
  ),
});

export default spacetimedb;

export const init = spacetimedb.init((ctx) => {
  // Seed with initial blog posts
  const posts = [
    {
      title: 'Building a Tiny Ray Tracer in Rust',
      category: 'mini-project',
      date: 'Mar 5, 2026',
      summary:
        'A weekend project: building a minimal ray tracer from scratch in Rust that renders reflections, shadows, and soft lighting in under 300 lines.',
      body: `<h3>Why a ray tracer?</h3>
<p>Ray tracing is one of those topics that sounds intimidating but becomes surprisingly approachable once you break it down. I wanted to understand the math behind it, so I built one from scratch.</p>

<h3>The setup</h3>
<p>The entire project is a single Rust file. No dependencies, no frameworks — just raw math and pixel pushing.</p>
<pre><code>struct Vec3 { x: f64, y: f64, z: f64 }

impl Vec3 {
    fn dot(&amp;self, other: &amp;Vec3) -&gt; f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }
    fn normalize(&amp;self) -&gt; Vec3 {
        let len = (self.dot(self)).sqrt();
        Vec3 { x: self.x / len, y: self.y / len, z: self.z / len }
    }
}</code></pre>

<h3>Key takeaways</h3>
<ul>
  <li>Reflection is just vector math — <code>r = d - 2(d·n)n</code></li>
  <li>Soft shadows come from sampling multiple light positions</li>
  <li>Rust's type system caught several math bugs at compile time</li>
</ul>

<p>The final render produces a 1920x1080 image with 3 spheres, a ground plane, and reflections — all in about 2 seconds on an M1 Mac.</p>`,
    },
    {
      title: 'Understanding Async/Await Under the Hood',
      category: 'deep-dive',
      date: 'Feb 20, 2026',
      summary:
        "What actually happens when you write async/await in JavaScript? Let's look at the state machine the engine builds and how the event loop orchestrates it all.",
      body: `<h3>The illusion of synchronous code</h3>
<p>Async/await makes asynchronous code look synchronous, but under the hood, the engine transforms your function into a state machine.</p>

<pre><code>// What you write:
async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  const user = await res.json();
  return user;
}

// What the engine roughly creates:
// A state machine with 3 states:
// State 0: call fetch(), suspend
// State 1: call res.json(), suspend
// State 2: return user, done</code></pre>

<h3>The event loop's role</h3>
<p>Each <code>await</code> is a suspension point. The engine saves the current execution context and yields back to the event loop, which can then process other microtasks, timers, or I/O events.</p>

<h3>Common pitfalls</h3>
<ul>
  <li>Sequential awaits when parallel is possible — use <code>Promise.all()</code></li>
  <li>Forgetting that <code>await</code> in a loop is sequential by default</li>
  <li>Error handling: unhandled rejections in async functions silently fail</li>
</ul>

<p>Understanding this mental model helps you write faster async code and debug subtle timing issues.</p>`,
    },
    {
      title: 'Build a CLI Todo App in 50 Lines of Python',
      category: 'tutorial',
      date: 'Feb 8, 2026',
      summary:
        "A beginner-friendly tutorial on building a persistent command-line todo app using Python's standard library — no pip install needed.",
      body: `<h3>What we're building</h3>
<p>A CLI todo app that supports <code>add</code>, <code>done</code>, <code>list</code>, and <code>clear</code> — with data persisted to a JSON file.</p>

<h3>The code</h3>
<pre><code>import json, sys
from pathlib import Path

DB = Path.home() / ".todos.json"

def load():
    return json.loads(DB.read_text()) if DB.exists() else []

def save(todos):
    DB.write_text(json.dumps(todos, indent=2))

def main():
    todos = load()
    cmd = sys.argv[1] if len(sys.argv) &gt; 1 else "list"

    if cmd == "add":
        task = " ".join(sys.argv[2:])
        todos.append({"task": task, "done": False})
        save(todos)
        print(f"Added: {task}")
    elif cmd == "done":
        idx = int(sys.argv[2]) - 1
        todos[idx]["done"] = True
        save(todos)
        print(f"Completed: {todos[idx]['task']}")
    elif cmd == "list":
        for i, t in enumerate(todos, 1):
            mark = "x" if t["done"] else " "
            print(f"  [{mark}] {i}. {t['task']}")
    elif cmd == "clear":
        save([t for t in todos if not t["done"]])
        print("Cleared completed tasks.")

if __name__ == "__main__":
    main()</code></pre>

<h3>How to use it</h3>
<pre><code>$ python todo.py add "Write blog post"
$ python todo.py add "Review PR"
$ python todo.py list
  [ ] 1. Write blog post
  [ ] 2. Review PR
$ python todo.py done 1
$ python todo.py list
  [x] 1. Write blog post
  [ ] 2. Review PR</code></pre>

<p>From here you could add colors with ANSI codes, priorities, or due dates. The beauty is in the simplicity.</p>`,
    },
    {
      title: 'Making a Real-Time Markdown Previewer with WebSockets',
      category: 'mini-project',
      date: 'Jan 25, 2026',
      summary:
        'A tiny weekend build: a split-pane Markdown editor that syncs in real-time across tabs using WebSockets and a 30-line Node.js server.',
      body: `<h3>The concept</h3>
<p>A two-pane editor — write Markdown on the left, see rendered HTML on the right — that syncs in real time across multiple browser tabs via WebSockets.</p>

<h3>The server (30 lines)</h3>
<pre><code>import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
let currentDoc = '# Hello World';

wss.on('connection', (ws) =&gt; {
  ws.send(JSON.stringify({ type: 'sync', content: currentDoc }));

  ws.on('message', (data) =&gt; {
    const msg = JSON.parse(data);
    if (msg.type === 'update') {
      currentDoc = msg.content;
      wss.clients.forEach(client =&gt; {
        if (client !== ws) {
          client.send(JSON.stringify({ type: 'sync', content: currentDoc }));
        }
      });
    }
  });
});</code></pre>

<h3>What I learned</h3>
<ul>
  <li>WebSocket setup is trivially simple with the <code>ws</code> package</li>
  <li>Debouncing updates prevents flooding the server on fast typing</li>
  <li>For production, you'd want operational transforms or CRDTs</li>
</ul>`,
    },
    {
      title: 'A Practical Guide to Docker Multi-Stage Builds',
      category: 'tutorial',
      date: 'Jan 12, 2026',
      summary:
        'How to shrink your Docker images by 90% using multi-stage builds. Real examples with Node.js and Rust applications.',
      body: `<h3>The problem</h3>
<p>Your Node.js Docker image is 1.2GB. Your users are sad. Your CI is slow. Multi-stage builds fix this.</p>

<h3>Before: single stage (1.2GB)</h3>
<pre><code>FROM node:20
WORKDIR /app
COPY . .
RUN npm ci &amp;&amp; npm run build
CMD ["node", "dist/index.js"]</code></pre>

<h3>After: multi-stage (120MB)</h3>
<pre><code># Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/index.js"]</code></pre>

<h3>Key principles</h3>
<ul>
  <li>Use <code>alpine</code> base images — they're ~5MB vs ~900MB</li>
  <li>Only copy what the production app needs from the build stage</li>
  <li>Put <code>package.json</code> COPY before source COPY to cache <code>npm ci</code></li>
  <li>For Rust, your final image can be <code>FROM scratch</code> — just the binary</li>
</ul>`,
    },
    {
      title: 'How DNS Actually Works (Explained with Diagrams)',
      category: 'deep-dive',
      date: 'Dec 28, 2025',
      summary:
        'A visual walkthrough of the DNS resolution process — from typing a URL to getting an IP address. Recursive resolvers, root servers, and caching explained.',
      body: `<h3>The question</h3>
<p>You type <code>example.com</code> in your browser. What happens next? The answer involves a distributed, hierarchical lookup system that's been running since 1983.</p>

<h3>The resolution chain</h3>
<pre><code>Browser cache
  → OS cache (/etc/hosts, systemd-resolved)
    → Recursive resolver (ISP / 1.1.1.1 / 8.8.8.8)
      → Root nameserver (.)
        → TLD nameserver (.com)
          → Authoritative nameserver (example.com)
            → IP address: 93.184.216.34</code></pre>

<h3>Caching at every layer</h3>
<p>Each step caches the result based on the TTL (Time to Live) set by the domain owner. This is why DNS changes don't propagate instantly.</p>

<h3>Common DNS record types</h3>
<ul>
  <li><code>A</code> — Maps domain to IPv4 address</li>
  <li><code>AAAA</code> — Maps domain to IPv6 address</li>
  <li><code>CNAME</code> — Alias to another domain</li>
  <li><code>MX</code> — Mail server routing</li>
  <li><code>TXT</code> — Arbitrary text (used for SPF, DKIM, verification)</li>
</ul>

<p>Understanding DNS helps you debug "it works on my machine" problems, CDN setups, and email deliverability issues.</p>`,
    },
  ];

  for (const post of posts) {
    ctx.db.blog_post.insert({
      id: 0n,
      title: post.title,
      category: post.category,
      date: post.date,
      summary: post.summary,
      body: post.body,
      createdAt: ctx.timestamp,
    });
  }
});

function requireAdmin(ctx: { sender: any; db: any }) {
  const admin = ctx.db.admin.identity.find(ctx.sender);
  if (!admin) throw new SenderError('Unauthorized: admin access required');
}

export const onConnect = spacetimedb.clientConnected((_ctx) => {});
export const onDisconnect = spacetimedb.clientDisconnected((_ctx) => {});

// Promote a caller to admin (only works if no admins exist yet — first-claim)
export const claim_admin = spacetimedb.reducer((ctx) => {
  for (const _ of ctx.db.admin.iter()) {
    throw new SenderError('Admin already claimed');
  }
  ctx.db.admin.insert({ identity: ctx.sender });
});

// Add a new blog post (admin only)
export const add_blog_post = spacetimedb.reducer(
  {
    title: t.string(),
    category: t.string(),
    date: t.string(),
    summary: t.string(),
    body: t.string(),
  },
  (ctx, { title, category, date, summary, body }) => {
    requireAdmin(ctx);
    ctx.db.blog_post.insert({
      id: 0n,
      title,
      category,
      date,
      summary,
      body,
      createdAt: ctx.timestamp,
    });
  }
);

// Update a blog post (admin only)
export const update_blog_post = spacetimedb.reducer(
  {
    id: t.u64(),
    title: t.string(),
    category: t.string(),
    date: t.string(),
    summary: t.string(),
    body: t.string(),
  },
  (ctx, { id, title, category, date, summary, body }) => {
    requireAdmin(ctx);
    const existing = ctx.db.blog_post.id.find(id);
    if (!existing) throw new SenderError('Blog post not found');
    ctx.db.blog_post.id.update({
      ...existing,
      title,
      category,
      date,
      summary,
      body,
    });
  }
);

// Delete a blog post (admin only)
export const delete_blog_post = spacetimedb.reducer(
  { id: t.u64() },
  (ctx, { id }) => {
    requireAdmin(ctx);
    ctx.db.blog_post.id.delete(id);
  }
);
