import { afterAll, describe, expect, it } from "vitest";
import app from "@/app";
import request from "supertest";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Auth", () => {
  afterAll(async () => {
    await db.delete(users).where(eq(users.email, "shklazt@gmail.com"));
  });
  it("register endpoint", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Tamir",
      email: "shklazt@gmail.com",
      password: "123456",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(["name"]);
    expect(response.body).toHaveProperty(["email"]);
  });
  it("login endpoint", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "shklazt@gmail.com",
      password: "123456",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
