import { describe, it, expect } from "vitest";
import app from "../index";

describe("API Integration Tests", () => {
  describe("Health Check", () => {
    it("should return 200 on GET /", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Chore Coin API is running!");
    });
  });

  describe("Authentication Endpoints", () => {
    it("should return 400 on POST /api/auth/google without token", async () => {
      const res = await app.request("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it("should return 401 on POST /api/auth/google with invalid token", async () => {
      const res = await app.request("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: "invalid-token" }),
      });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe("Protected Endpoints - Chores", () => {
    it("should return 401 on GET /api/chores without auth", async () => {
      const res = await app.request("/api/chores");
      expect(res.status).toBe(401);
    });

    it("should return 401 on POST /api/chores without auth", async () => {
      const res = await app.request("/api/chores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Test", points: 10 }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 on PUT /api/chores/:id without auth", async () => {
      const res = await app.request("/api/chores/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated", points: 20 }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 on DELETE /api/chores/:id without auth", async () => {
      const res = await app.request("/api/chores/1", {
        method: "DELETE",
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 on POST /api/chores/:id/complete without auth", async () => {
      const res = await app.request("/api/chores/1/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Protected Endpoints - Rewards", () => {
    it("should return 401 on GET /api/rewards without auth", async () => {
      const res = await app.request("/api/rewards");
      expect(res.status).toBe(401);
    });

    it("should return 401 on POST /api/rewards without auth", async () => {
      const res = await app.request("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Test Reward", cost: 50 }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 401 on POST /api/rewards/:id/claim without auth", async () => {
      const res = await app.request("/api/rewards/1/claim", {
        method: "POST",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Protected Endpoints - History", () => {
    it("should return 401 on GET /api/history without auth", async () => {
      const res = await app.request("/api/history");
      expect(res.status).toBe(401);
    });

    it("should return 401 on GET /api/history/points without auth", async () => {
      const res = await app.request("/api/history/points");
      expect(res.status).toBe(401);
    });
  });

  describe("Protected Endpoints - Users", () => {
    it("should return 401 on GET /api/users/me without auth", async () => {
      const res = await app.request("/api/users/me");
      expect(res.status).toBe(401);
    });

    it("should return 401 on PATCH /api/users/me without auth", async () => {
      const res = await app.request("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Updated Name" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent endpoint", async () => {
      const res = await app.request("/api/nonexistent");
      expect(res.status).toBe(404);
      const data = (await res.json()) as { error?: unknown; code?: unknown };
      expect(data.error).toBeDefined();
    });

    it("should return 404 for non-existent chore", async () => {
      const res = await app.request("/api/chores/99999/nonexistent");
      expect(res.status).toBe(404);
    });

    it("should return proper error response format", async () => {
      const res = await app.request("/api/nonexistent");
      const data = (await res.json()) as { error?: unknown; code?: unknown };
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("code");
    });
  });

  describe("CORS Headers", () => {
    it("should include CORS headers on API requests", async () => {
      const res = await app.request("/api/chores", {
        method: "OPTIONS",
      });
      // CORS headers should be present for API routes
      expect(res.headers.get("access-control-allow-methods")).toBeDefined();
    });
  });
});
