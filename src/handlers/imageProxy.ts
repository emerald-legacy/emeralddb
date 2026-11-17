import { Request, Response } from 'express'
import http from 'http'
import https from 'https'

const ALLOWED_DOMAINS = ['lcg-cdn.fantasyflightgames.com', 'images-cdn.fantasyflightgames.com']

export async function handler(req: Request, res: Response): Promise<void> {
  const url = typeof req.query.url === 'string' ? req.query.url : undefined
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' })
    return
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    res.status(400).json({ error: 'Invalid URL' })
    return
  }

  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    res.status(403).json({ error: 'Domain not allowed' })
    return
  }

  const client = parsed.protocol === 'https:' ? https : http

  const proxyReq = client.get(url, (proxyRes) => {
    if (!proxyRes.statusCode || proxyRes.statusCode >= 400) {
      res.status(proxyRes.statusCode || 502).json({ error: 'Upstream request failed' })
      return
    }

    const contentType = proxyRes.headers['content-type']
    if (contentType) {
      res.set('Content-Type', contentType)
    }
    res.set('Cache-Control', 'public, max-age=86400')
    res.status(proxyRes.statusCode)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to fetch image' })
    }
  })
}
