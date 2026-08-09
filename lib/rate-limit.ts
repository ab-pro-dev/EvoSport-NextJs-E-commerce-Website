import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; expiresAt: number };
}

const rateLimitMap: RateLimitStore = {};

// Simple in-memory sliding window rate limiter
export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap[ip];

  if (!record || now > record.expiresAt) {
    rateLimitMap[ip] = {
      count: 1,
      expiresAt: now + windowMs,
    };
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
