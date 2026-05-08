import type { FastifyPluginAsync } from "fastify";
import analyticsRoutes from "./analytics.routes.js";
import authRoutes from "./auth.routes.js";
import menuRoutes from "./menu.routes.js";
import ordersRoutes from "./orders.routes.js";
import restaurantsRoutes from "./restaurants.routes.js";
import usersRoutes from "./users.routes.js";

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(restaurantsRoutes, { prefix: "/restaurants" });
  await fastify.register(menuRoutes, { prefix: "/restaurants/:restaurantId/menu" });
  await fastify.register(ordersRoutes, { prefix: "/orders" });
  await fastify.register(usersRoutes, { prefix: "/users" });
  await fastify.register(analyticsRoutes, { prefix: "/analytics" });
};

export default routes;
