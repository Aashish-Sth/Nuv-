import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

const periodSchema = z.object({
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
});

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);
  fastify.addHook("preHandler", requireRole("ADMIN", "STAFF"));

  fastify.get("/overview", async (_request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalRevenue,
      activeRestaurants,
      totalCustomers,
      ordersToday,
      revenueToday,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true } }),
    ]);

    return reply.send({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total ?? 0,
        activeRestaurants,
        totalCustomers,
        ordersToday,
        revenueToday: revenueToday._sum.total ?? 0,
      },
    });
  });

  fastify.get("/orders-by-status", async (_request, reply) => {
    const grouped = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    const result = ORDER_STATUSES.map((status) => ({
      status,
      count: grouped.find((g) => g.status === status)?._count.status ?? 0,
    }));
    return reply.send({ success: true, data: result });
  });

  fastify.get("/revenue-chart", async (request, reply) => {
    const { period } = periodSchema.parse(request.query);
    const days = Number.parseInt(period.replace("d", ""), 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const byDate = new Map<string, { revenue: number; orderCount: number }>();
    for (let index = 0; index < days; index += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      byDate.set(key, { revenue: 0, orderCount: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const existing = byDate.get(key);
      if (existing) {
        existing.revenue += order.total;
        existing.orderCount += 1;
      }
    }

    return reply.send({
      success: true,
      data: [...byDate.entries()].map(([date, values]) => ({ date, ...values })),
    });
  });

  fastify.get("/top-restaurants", async (_request, reply) => {
    const top = await prisma.order.groupBy({
      by: ["restaurantId"],
      _count: { restaurantId: true },
      _sum: { total: true },
      orderBy: { _count: { restaurantId: "desc" } },
      take: 5,
    });

    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: top.map((item) => item.restaurantId) } },
      select: { id: true, name: true },
    });
    const map = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name]));

    return reply.send({
      success: true,
      data: top.map((item) => ({
        restaurantId: item.restaurantId,
        restaurantName: map.get(item.restaurantId) ?? "Unknown",
        orderCount: item._count.restaurantId,
        revenue: item._sum.total ?? 0,
      })),
    });
  });
};

export default analyticsRoutes;
