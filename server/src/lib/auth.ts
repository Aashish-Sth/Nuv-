import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@nuve/shared";

type JwtPayload = {
  userId: string;
  role: UserRole;
};

const REFRESH_COOKIE_NAME = "nuve_refresh";

export async function generateTokens(
  request: FastifyRequest,
  userId: string,
  role: UserRole,
) {
  const payload: JwtPayload = { userId, role };
  const accessToken = await request.server.jwt.sign(payload, { expiresIn: "15m" });
  const refreshToken = await request.server.jwt.sign(payload, { expiresIn: "7d" });

  return { accessToken, refreshToken };
}

export function setRefreshCookie(reply: FastifyReply, token: string) {
  reply.setCookie(REFRESH_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function verifyRefreshToken(request: FastifyRequest, token: string) {
  return request.server.jwt.verify<JwtPayload>(token);
}

export { REFRESH_COOKIE_NAME };
