---
title: "Fixing N8N Docker Error The X-Forwarded-For Issue + Bonus"
description: "Fixing N8N Docker Error: The X Forwarded For Issue + Bonus So you're running N8N locally in Docker, maybe conveniently for this post using Ngrok to expose it, and suddenly your log"
permalink: "fixing-n8n-docker-error-the-x-forwarded-for-issue-bonus"
order: 8
publishedAt: "2025-11-18T05:00:06.000Z"
readingTime: 4
heroImage: "/medium-assets/08/img-01.png"
sourceUrl: "https://medium.com/@mister.funable/fixing-n8n-docker-error-the-x-forwarded-for-issue-bonus-d6924694b09a"
---
<!-- Source: https://medium.com/@mister.funable/fixing-n8n-docker-error-the-x-forwarded-for-issue-bonus-d6924694b09a -->
<!-- Published: 2025-11-18T02:00:06 -->
# Fixing N8N Docker Error: The X-Forwarded-For Issue + Bonus

So you're running N8N locally in Docker, maybe conveniently for this post using Ngrok to expose it, and suddenly your logs are full of scary errors about `X-Forwarded-For` headers and trust proxies. Yeah, I ran into this too.

<!-- Image Source: https://miro.medium.com/1*jsiW-GEKJ-MI5RjOGcAigQ.png | Local: /medium-assets/08/img-01.png -->
![**The tide is high, but I'm holdin' on**](/medium-assets/08/img-01.png)

Let me show you how I fixed it.

## What Was Breaking

I was running N8N in Docker using docker-compose, exposing it through Ngrok so I could test webhooks from external services. Everything seemed fine until I checked the logs and saw this mess:

```bash
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default). This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users.
```

The error keeps repeating with a full stack trace. Not great.

### The Solution

Add to the Docker Compose the following line `N8N_PROXY_HOPS=1`

It should look like this:

```yaml
# https://github.com/MisterFunable/Local-N8N/blob/main/compose.yaml

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    labels:
      - traefik.enable=false
    environment:
      - N8N_PROXY_HOPS=1
      - (bunch of variables)
 volumes:
   - n8n_data:/home/node/.n8n
   - ./local-files:/files
```

That's it. From your folder/path, restart your container:

```typescript
docker-compose down
docker-compose up -d
```

You shouldn't see the error anymore in the logs.

### Why This Works

When you use Ngrok (or any reverse proxy), it adds an `X-Forwarded-For` header to requests so the backend knows what the original client IP was. But by default, Express (which N8N uses under the hood) doesn't trust those headers.

Why? Security. If Express blindly trusted every `X-Forwarded-For` header, anyone could spoof their IP address by just adding that header to their requests.

But when you're actually behind a legitimate proxy like ngrok, you need Express to trust it. The `N8N_PROXY_HOPS` variable tells N8N "hey, I'm behind 1 proxy, trust the first X-Forwarded-For header you see."

If you were behind multiple proxies (like nginx → ngrok → N8N), you'd set it to `N8N_PROXY_HOPS=2`

## Bonus: Other Deprecation Warnings

While fixing this, I also got hit with some deprecation warnings about environment variables.

Here's what showed up in my logs:

```vbnet
There are deprecations related to your environment variables. Please take the recommended actions to update your configuration:
- DB_SQLITE_POOL_SIZE -> Running SQLite without a pool of read connections is deprecated. Please set `DB_SQLITE_POOL_SIZE` to a value higher than zero.
- N8N_BLOCK_ENV_ACCESS_IN_NODE -> The default value of N8N_BLOCK_ENV_ACCESS_IN_NODE will be changed from false to true in a future version.
- N8N_GIT_NODE_DISABLE_BARE_REPOS -> Support for bare repositories in the Git Node will be removed in a future version due to security concerns.
```

### DB_SQLITE_POOL_SIZE

If you're using SQLite (which is the default for local N8N), add:

```bash
- DB_SQLITE_POOL_SIZE=5
```

This creates a pool of 5 read connections, which improves performance. You can adjust this number if needed.

### N8N_BLOCK_ENV_ACCESS_IN_NODE

This one's about security. By default, N8N lets you access environment variables from the Code Node or expressions. In the future, this will be blocked by default.

If you need to access environment variables in your workflows, add:

```bash
- N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

If you don't need that access (most people don't), add:

```bash
- N8N_BLOCK_ENV_ACCESS_IN_NODE=true
```

I went with `true` because I don't use env vars in my workflows.

### N8N_GIT_NODE_DISABLE_BARE_REPOS

This is about the Git Node and bare repositories. Unless you're using bare repos (you probably aren't), just add:

```bash
- N8N_GIT_NODE_DISABLE_BARE_REPOS=true
```

---

## My Updated docker-compose.yml

```bash
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    labels:
      - traefik.enable=false
    environment:
      - N8N_PROXY_HOPS=1
      - DB_SQLITE_POOL_SIZE=5
      - N8N_BLOCK_ENV_ACCESS_IN_NODE=true
      - N8N_GIT_NODE_DISABLE_BARE_REPOS=true
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      - N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_RUNNERS_ENABLED=true
      - NODE_ENV=production
      - WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - TZ=${GENERIC_TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files

volumes:
  n8n_data:
```

After updating, restart:

```typescript
docker-compose down
docker-compose up -d
```

Check the logs, and the deprecation warnings should be gone too.

## Wrapping Up

Running N8N locally with Docker and ngrok is really helpful to avoid making and maintaining extra code. But the default Express security settings will fight you if you don't tell N8N to trust your proxy.

At worst, your only problem should be keeping up with the latest updates automatically, which I would like to cover in a future post.

Now go build some workflows without worrying about the logs screaming at you.
