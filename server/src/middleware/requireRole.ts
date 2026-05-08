import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@nuve/shared";

export function requireRole(...roles: UserRole[]) {
  return async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return reply.code(403).send({ success: false, error: "Forbidden" });
    }
  };
}
