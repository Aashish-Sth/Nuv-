import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const idSchema = z.object({ id: z.string().cuid() });
const roleSchema = z.object({ role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]) });

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: [authenticate, requireRole("ADMIN")] }, async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        items: users,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  fastify.patch(
    "/:id/role",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const { role } = roleSchema.parse(request.body);
      if (id === request.user!.userId && role !== "ADMIN") {
        return reply.code(400).send({ success: false, error: "You cannot demote yourself" });
      }
      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      return reply.send({ success: true, data: user });
    },
  );

  fastify.patch(
    "/:id/status",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return reply.code(404).send({ success: false, error: "User not found" });
      }
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: !existing.isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      return reply.send({ success: true, data: user });
    },
  );
};

export default usersRoutes;
