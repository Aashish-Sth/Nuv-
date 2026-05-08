import type { ApiResponse } from "@nuve/shared";
import bcrypt from "bcrypt";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import {
  clearRefreshCookie,
  generateTokens,
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  verifyRefreshToken,
} from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateMeSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    },
  );

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tokens = await generateTokens(request, user.id, user.role);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });

    setRefreshCookie(reply, tokens.refreshToken);
    const response: ApiResponse<{ user: typeof user; accessToken: string }> = {
      success: true,
      data: { user, accessToken: tokens.accessToken },
    };
    return reply.code(201).send(response);
  });

  fastify.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) {
      return reply
        .code(401)
        .send({ success: false, error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return reply
        .code(401)
        .send({ success: false, error: "Invalid credentials" });
    }

    const tokens = await generateTokens(request, user.id, user.role);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });
    setRefreshCookie(reply, tokens.refreshToken);

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: tokens.accessToken,
      },
    });
  });

  fastify.post("/refresh", async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      return reply
        .code(401)
        .send({ success: false, error: "Missing refresh token" });
    }

    const payload = await verifyRefreshToken(request, token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user?.refreshToken) {
      return reply
        .code(401)
        .send({ success: false, error: "Invalid refresh token" });
    }

    const matches = await bcrypt.compare(token, user.refreshToken);
    if (!matches) {
      return reply
        .code(401)
        .send({ success: false, error: "Invalid refresh token" });
    }

    const tokens = await generateTokens(request, user.id, user.role);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });
    setRefreshCookie(reply, tokens.refreshToken);
    return reply.send({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  });

  fastify.post(
    "/logout",
    { preHandler: [authenticate] },
    async (request, reply) => {
      if (request.user?.userId) {
        await prisma.user.update({
          where: { id: request.user.userId },
          data: { refreshToken: null },
        });
      }
      clearRefreshCookie(reply);
      return reply.send({ success: true, message: "Logged out" });
    },
  );

  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return reply.code(404).send({ success: false, error: "User not found" });
    }
    return reply.send({ success: true, data: user });
  });

  fastify.patch(
    "/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = updateMeSchema.parse(request.body);
      const userId = request.user!.userId;

      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (!existing) {
        return reply
          .code(404)
          .send({ success: false, error: "User not found" });
      }

      if (body.email && body.email !== existing.email) {
        const taken = await prisma.user.findUnique({
          where: { email: body.email },
        });
        if (taken) {
          return reply
            .code(409)
            .send({ success: false, error: "Email is already in use" });
        }
      }

      let nextPasswordHash: string | undefined;
      if (body.newPassword) {
        const matches = await bcrypt.compare(
          body.currentPassword!,
          existing.passwordHash,
        );
        if (!matches) {
          return reply
            .code(400)
            .send({ success: false, error: "Current password is incorrect" });
        }
        nextPasswordHash = await bcrypt.hash(body.newPassword, 12);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.email ? { email: body.email } : {}),
          ...(nextPasswordHash ? { passwordHash: nextPasswordHash } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.send({ success: true, data: updated });
    },
  );
};

export default authRoutes;
