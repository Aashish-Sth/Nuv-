import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const paramsSchema = z.object({
  restaurantId: z.string().cuid(),
});

const itemParamsSchema = z.object({
  restaurantId: z.string().cuid(),
  itemId: z.string().cuid(),
});

const itemBodySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(3),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  image: z
    .string()
    .refine(
      (value) => {
        if (value.startsWith("data:image/")) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Image must be a valid URL or image data URI" },
    )
    .nullable()
    .optional(),
  isAvailable: z.boolean().optional(),
});

async function canManageRestaurant(
  restaurantId: string,
  userId: string,
  role: "ADMIN" | "STAFF",
) {
  if (role === "ADMIN") {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    return Boolean(restaurant);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });
  if (!restaurant) return false;
  return restaurant.ownerId === userId;
}

const menuRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request, reply) => {
    const { restaurantId } = paramsSchema.parse(request.params);
    const items = await prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    });

    const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return reply.send({ success: true, data: grouped });
  });

  fastify.post(
    "/",
    { preHandler: [authenticate, requireRole("ADMIN", "STAFF")] },
    async (request, reply) => {
      const { restaurantId } = paramsSchema.parse(request.params);
      const user = request.user as { userId: string; role: "ADMIN" | "STAFF" } | undefined;
      const hasAccess = await canManageRestaurant(
        restaurantId,
        user?.userId ?? "",
        user?.role ?? "STAFF",
      );
      if (!hasAccess) {
        return reply.code(403).send({ success: false, error: "Forbidden" });
      }

      const body = itemBodySchema.parse(request.body);
      const item = await prisma.menuItem.create({
        data: {
          restaurantId,
          name: body.name,
          description: body.description,
          price: body.price,
          category: body.category,
          image: body.image ?? null,
          isAvailable: body.isAvailable ?? true,
        },
      });
      return reply.code(201).send({ success: true, data: item });
    },
  );

  fastify.patch(
    "/:itemId",
    { preHandler: [authenticate, requireRole("ADMIN", "STAFF")] },
    async (request, reply) => {
      const { restaurantId, itemId } = itemParamsSchema.parse(request.params);
      const user = request.user as { userId: string; role: "ADMIN" | "STAFF" } | undefined;
      const hasAccess = await canManageRestaurant(
        restaurantId,
        user?.userId ?? "",
        user?.role ?? "STAFF",
      );
      if (!hasAccess) {
        return reply.code(403).send({ success: false, error: "Forbidden" });
      }

      const existing = await prisma.menuItem.findFirst({
        where: { id: itemId, restaurantId },
        select: { id: true },
      });
      if (!existing) {
        return reply
          .code(404)
          .send({ success: false, error: "Menu item not found" });
      }

      const body = itemBodySchema.partial().parse(request.body);
      const item = await prisma.menuItem.update({
        where: { id: itemId },
        data: body,
      });
      return reply.send({ success: true, data: item });
    },
  );

  fastify.delete(
    "/:itemId",
    { preHandler: [authenticate, requireRole("ADMIN", "STAFF")] },
    async (request, reply) => {
      const { restaurantId, itemId } = itemParamsSchema.parse(request.params);
      const user = request.user as { userId: string; role: "ADMIN" | "STAFF" } | undefined;
      const hasAccess = await canManageRestaurant(
        restaurantId,
        user?.userId ?? "",
        user?.role ?? "STAFF",
      );
      if (!hasAccess) {
        return reply.code(403).send({ success: false, error: "Forbidden" });
      }

      const existing = await prisma.menuItem.findFirst({
        where: { id: itemId, restaurantId },
        select: { id: true },
      });
      if (!existing) {
        return reply
          .code(404)
          .send({ success: false, error: "Menu item not found" });
      }

      const item = await prisma.menuItem.update({
        where: { id: itemId },
        data: { isAvailable: false },
      });
      return reply.send({
        success: true,
        data: item,
        message: "Menu item removed",
      });
    },
  );
};

export default menuRoutes;
