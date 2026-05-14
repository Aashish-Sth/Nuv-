import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import type { ApiResponse } from "@nuve/shared";
import routes from "./routes/index.js";

async function bootstrap() {
  const app = Fastify({ logger: true });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET ?? "cookie-secret-dev-only",
    hook: "onRequest",
  });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "jwt-secret-dev-only",
    sign: { expiresIn: "15m" },
  });
  await app.register(multipart);
  await app.register(routes, { prefix: "/api" });

  app.setErrorHandler((error, _request, reply) => {
    let statusCode = 500;
    let message = "Internal server error";

    if (error instanceof ZodError) {
      statusCode = 400;
      message = error.issues.map((issue) => issue.message).join(", ");
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        statusCode = 409;
        message = "Resource already exists";
      } else if (error.code === "P2025") {
        statusCode = 404;
        message = "Resource not found";
      }
    } else if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "UnauthorizedError"
    ) {
      statusCode = 401;
      message = "Unauthorized";
    }

    const response: ApiResponse<null> = { success: false, error: message };
    reply.code(statusCode).send(response);
  });

  const port = Number.parseInt(process.env.PORT ?? "3001", 10);
  await app.listen({ port, host: "0.0.0.0" });
}

void bootstrap();
