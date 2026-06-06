import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { app } from "../app";
import { User } from "../models/User";

const PASSWORD = "Password1!";

function registerBody(overrides: Record<string, unknown> = {}) {
  return {
    username: "testuser",
    email: "test@example.com",
    password: PASSWORD,
    confirmPassword: PASSWORD,
    recaptchaToken: "test-recaptcha-token",
    name: "Test User",
    ...overrides,
  };
}

async function createUser(
  overrides: Partial<{
    username: string;
    email: string;
    password: string;
    role: "user" | "moderator" | "admin";
  }> = {}
) {
  const plainPassword = overrides.password ?? PASSWORD;

  const user = await User.create({
    username: overrides.username ?? "testuser",
    email: overrides.email ?? "test@example.com",
    password: await bcrypt.hash(plainPassword, 10),
    role: overrides.role ?? "user",
  });

  return { user, plainPassword };
}

describe("auth routes", () => {
  describe("POST /api/v1/auth/register", () => {
    it("creates a user and hashes the password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody());

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ data: "testuser" });

      const user = await User.findOne({ username: "testuser" });
      expect(user).not.toBeNull();

      if (!user) throw new Error("Expected user to exist");

      expect(user.password).not.toBe(PASSWORD);
      expect(await bcrypt.compare(PASSWORD, user.password)).toBe(true);
    });

    it("rejects missing username", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody({ username: undefined }));

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING CREDENTIALS");
    });

    it("rejects weak password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(
          registerBody({
            password: "weakpass",
            confirmPassword: "weakpass",
          })
        );

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING CREDENTIALS");
    });

    it("rejects password confirmation mismatch", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody({ confirmPassword: "OtherPassword1!" }));

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING CREDENTIALS");
    });

    it("rejects duplicate username", async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody());

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerBody({ email: "other@example.com" }));

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("USER_ALREADY_REGISTERED");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with valid credentials and sets a token cookie", async () => {
      await createUser();

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          username: "testuser",
          password: PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("LOGIN_SUCCESS");
      expect(res.body.username).toBe("testuser");
      expect(res.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("token=")])
      );

      const user = await User.findOne({ username: "testuser" });
      expect(user).not.toBeNull();
      if (!user) throw new Error("user missing");
      expect(user.loginAttempts).toBe(0);
      expect(user.lockUntil).toBeUndefined();
    });

    it("rejects missing credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING CREDENTIALS");
    });

    it("rejects invalid password and increments loginAttempts", async () => {
      await createUser();

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          username: "testuser",
          password: "WrongPassword1!",
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");

      const user = await User.findOne({ username: "testuser" });
      expect(user?.loginAttempts).toBe(1);
    });

    it("locks the account after 5 failed login attempts", async () => {
      await createUser();

      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post("/api/v1/auth/login")
          .send({
            username: "testuser",
            password: "WrongPassword1!",
          });

        expect(res.status).toBe(401);
      }

      const lockedUser = await User.findOne({ username: "testuser" });
      expect(lockedUser?.lockUntil).toBeInstanceOf(Date);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          username: "testuser",
          password: PASSWORD,
        });

      expect(res.status).toBe(423);
      expect(res.body.code).toBe("ACCOUNT_LOCKED");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("rejects missing token", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("NO_TOKEN");
    });

    it("rejects invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("returns the current user with a valid bearer token", async () => {
      const { user } = await createUser();

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("USER_FETCHED");
      expect(res.body.data.username).toBe("testuser");
      expect(res.body.data.role).toBe("user");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("returns the current user with a valid login cookie", async () => {
      await createUser();

      const agent = request.agent(app);

      await agent.post("/api/v1/auth/login").send({
        username: "testuser",
        password: PASSWORD,
      });

      const res = await agent.get("/api/v1/auth/me");

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("USER_FETCHED");
      expect(res.body.data.username).toBe("testuser");
    });

    it("returns 404 when token is valid but user no longer exists", async () => {
      const token = jwt.sign(
        {
          id: new mongoose.Types.ObjectId().toString(),
          role: "user",
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("USER_NOT_FOUND");
    });
  });
});
