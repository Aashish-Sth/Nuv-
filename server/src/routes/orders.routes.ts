import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
type OrderStatus = z.infer<typeof orderStatusSchema>;

const createOrderSchema = z.object({
  restaurantId: z.string().cuid(),
  items: z.array(z.object({ menuItemId: z.string().cuid(), qty: z.number().int().positive() })).min(1),
  deliveryAddress: z.string().min(10),
  notes: z.string().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  status: orderStatusSchema.optional(),
  restaurantId: z.string().cuid().optional(),
});

const idParamSchema = z.object({ id: z.string().cuid() });
const statusBodySchema = z.object({ status: orderStatusSchema });

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", { preHandler: [authenticate] }, async (request, reply) => {
    const body = createOrderSchema.parse(request.body);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: body.items.map((item) => item.menuItemId) },
        restaurantId: body.restaurantId,
        isAvailable: true,
      },
    });

    if (menuItems.length !== body.items.length) {
      return reply.code(400).send({ success: false, error: "Some items are invalid or unavailable" });
    }

    const itemMap = new Map(menuItems.map((item) => [item.id, item]));
    const total = body.items.reduce((acc, item) => {
      const menuItem = itemMap.get(item.menuItemId)!;
      return acc + menuItem.price * item.qty;
    }, 0);

    const order = await prisma.order.create({
      data: {
        customerId: request.user!.userId,
        restaurantId: body.restaurantId,
        deliveryAddress: body.deliveryAddress,
        notes: body.notes,
        total,
        items: {
          create: body.items.map((item) => {
            const menuItem = itemMap.get(item.menuItemId)!;
            return {
              menuItemId: menuItem.id,
              qty: item.qty,
              price: menuItem.price,
              name: menuItem.name,
            };
          }),
        },
      },
      include: { items: true },
    });

    return reply.code(201).send({ success: true, data: order });
  });

  fastify.get("/my", { preHandler: [authenticate] }, async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const where = { customerId: request.user!.userId };
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          restaurant: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
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

  fastify.get(
    "/",
    { preHandler: [authenticate, requireRole("ADMIN", "STAFF")] },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query);
      const where = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.restaurantId ? { restaurantId: query.restaurantId } : {}),
      };
      const [total, items] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          include: { items: true, customer: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
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
    },
  );

  fastify.get("/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, restaurant: true },
    });
    if (!order) {
      return reply.code(404).send({ success: false, error: "Order not found" });
    }

    if (request.user!.role === "CUSTOMER" && order.customerId !== request.user!.userId) {
      return reply.code(403).send({ success: false, error: "Forbidden" });
    }

    return reply.send({ success: true, data: order });
  });

  fastify.patch(
    "/:id/status",
    { preHandler: [authenticate, requireRole("STAFF", "ADMIN")] },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params);
      const { status } = statusBodySchema.parse(request.body);
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return reply.code(404).send({ success: false, error: "Order not found" });
      }

      if (!validTransitions[order.status].includes(status)) {
        return reply.code(400).send({ success: false, error: "Invalid status transition" });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.order.updateMany({
          where: { id, status: order.status },
          data: { status },
        });
        if (result.count === 0) {
          return null;
        }

        await tx.auditLog.create({
          data: {
            action: "ORDER_STATUS_CHANGED",
            entityType: "Order",
            entityId: id,
            performedById: request.user!.userId,
            metadata: { from: order.status, to: status },
          },
        });

        return tx.order.findUnique({
          where: { id },
          include: { items: true },
        });
      });

      if (!updated) {
        return reply
          .code(409)
          .send({ success: false, error: "Order status changed by another request. Please retry." });
      }

      return reply.send({ success: true, data: updated });
    },
  );
};

export default orderRoutes;
