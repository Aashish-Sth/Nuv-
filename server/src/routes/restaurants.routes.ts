import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["rating", "newest"]).optional(),
});

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  cuisine: z.string().min(2),
  cuisines: z.array(z.string().min(2)).min(1),
  deliveryTime: z.coerce.number().int().positive(),
  minOrder: z.coerce.number().positive(),
  image: z.string().url(),
});

const updateSchema = createSchema.partial();
const idSchema = z.object({ id: z.string().cuid() });

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const restaurantRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const where = {
      isActive: true,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { description: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.category ? { cuisines: { has: query.category } } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: query.sort === "rating" ? { rating: "desc" } : { createdAt: "desc" },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        items,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = idSchema.parse(request.params);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { category: "asc" },
        },
      },
    });
    if (!restaurant || !restaurant.isActive) {
      return reply.code(404).send({ success: false, error: "Restaurant not found" });
    }

    const groupedMenu = restaurant.menuItems.reduce<Record<string, typeof restaurant.menuItems>>(
      (acc, item) => {
        const key = item.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );

    return reply.send({ success: true, data: { ...restaurant, groupedMenu } });
  });

  fastify.post(
    "/",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (request, reply) => {
      const body = createSchema.parse(request.body);
      const baseSlug = slugify(body.name);
      const slug = `${baseSlug}-${Date.now()}`;
      const restaurant = await prisma.restaurant.create({
        data: { ...body, slug, ownerId: request.user!.userId },
      });
      return reply.code(201).send({ success: true, data: restaurant });
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: [authenticate, requireRole("ADMIN", "STAFF")] },
    async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const body = updateSchema.parse(request.body);
      const existing = await prisma.restaurant.findUnique({ where: { id } });
      if (!existing) {
        return reply.code(404).send({ success: false, error: "Restaurant not found" });
      }

      const isAdmin = request.user!.role === "ADMIN";
      if (!isAdmin && existing.ownerId !== request.user!.userId) {
        return reply.code(403).send({ success: false, error: "Forbidden" });
      }

      const updated = await prisma.restaurant.update({
        where: { id },
        data: body,
      });
      return reply.send({ success: true, data: updated });
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: { isActive: false },
      });
      await prisma.auditLog.create({
        data: {
          action: "RESTAURANT_SOFT_DELETE",
          entityType: "Restaurant",
          entityId: id,
          performedById: request.user!.userId,
        },
      });
      return reply.send({ success: true, data: restaurant, message: "Restaurant deleted" });
    },
  );

  fastify.patch(
    "/:id/verify",
    { preHandler: [authenticate, requireRole("ADMIN")] },
    async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const existing = await prisma.restaurant.findUnique({ where: { id } });
      if (!existing) {
        return reply.code(404).send({ success: false, error: "Restaurant not found" });
      }
      const updated = await prisma.restaurant.update({
        where: { id },
        data: { isVerified: !existing.isVerified },
      });
      return reply.send({ success: true, data: updated });
    },
  );
};

export default restaurantRoutes;
