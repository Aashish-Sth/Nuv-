import type { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.code(401).send({ success: false, error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return reply.code(401).send({ success: false, error: "Unauthorized" });
  }

  try {
    const payload = await request.server.jwt.verify<{
      userId: string;
      role: "CUSTOMER" | "STAFF" | "ADMIN";
    }>(token);
    request.user = payload;
  } catch {
    return reply.code(401).send({ success: false, error: "Unauthorized" });
  }
}
