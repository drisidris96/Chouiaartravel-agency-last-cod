import { type Request, type Response, type NextFunction } from "express";
import { logger } from "../lib/logger";

// ─── Blocked paths (sensitive file scans) ────────────────────────────────────
const BLOCKED_PATH_PATTERNS = [
  /\.env/i,
  /\.git/i,
  /\.htaccess/i,
  /\.htpasswd/i,
  /wp-admin/i,
  /wp-login/i,
  /phpMyAdmin/i,
  /phpmyadmin/i,
  /adminer/i,
  /config\.php/i,
  /config\.json/i,
  /config\.env/i,
  /credentials/i,
  /secrets/i,
  /backup/i,
  /database\.sql/i,
  /dump\.sql/i,
  /\.sql$/i,
  /stripe\.ts/i,
  /payment\/config/i,
  /\/etc\/passwd/i,
  /\/proc\//i,
  /\.\.\//,
];

// ─── Blocked user agents (scanners / bots) ───────────────────────────────────
const BLOCKED_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /python-requests/i,
  /go-http-client/i,
  /curl\/7\.[0-5]/i,
  /libwww-perl/i,
  /scanner/i,
  /exploit/i,
  /fuzzer/i,
];

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false; // not limited
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true; // limited
  }
  return false;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// ─── Middleware: block suspicious paths ──────────────────────────────────────
export function blockSuspiciousPaths(req: Request, res: Response, next: NextFunction) {
  const url = req.originalUrl || req.url;

  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(url)) {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      logger.warn({ ip, url, ua: req.headers["user-agent"] }, "Blocked suspicious path scan");
      res.status(404).json({ message: "Not found" });
      return;
    }
  }

  next();
}

// ─── Middleware: block bad user agents ───────────────────────────────────────
export function blockBadAgents(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] || "";

  for (const pattern of BLOCKED_AGENTS) {
    if (pattern.test(ua)) {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      logger.warn({ ip, ua, url: req.originalUrl }, "Blocked bad user agent");
      res.status(403).json({ message: "Forbidden" });
      return;
    }
  }

  next();
}

// ─── Middleware: rate limit auth endpoints ────────────────────────────────────
export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  // Max 10 auth attempts per 15 minutes per IP
  if (rateLimit(ip, 10, 15 * 60 * 1000)) {
    logger.warn({ ip, url: req.originalUrl }, "Rate limit exceeded on auth endpoint");
    res.status(429).json({
      message: "لقد تجاوزت الحد المسموح به. يرجى الانتظار 15 دقيقة والمحاولة مجدداً.",
    });
    return;
  }

  next();
}

// ─── Middleware: add security headers ────────────────────────────────────────
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  next();
}
