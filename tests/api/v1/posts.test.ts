import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "@/app"; // Adjust this import path as needed
import { eq } from "drizzle-orm";
import { comments, posts, users } from "@/db/schema";
import { db } from "@/db/drizzle";
import { v4 as uuidv4 } from "uuid";

describe("Posts and Comments", () => {
  let authToken: string;
  let createdPostId: string;
  let nestedPostId: string;
  let firstTopLevelCommentId: string;
  let secondTopLevelCommentId: string;
  let firstSecondLevelCommentId: string;
  let secondSecondLevelCommentId: string;

  // Setup: Create a test user for authentication
  beforeAll(async () => {
    // Register a test user
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });

    // Login to get the auth token
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    authToken = loginResponse.body.token;
  });

  // Cleanup: Remove test data after all tests
  afterAll(async () => {
    await db.delete(comments).where(eq(comments.postId, createdPostId));
    await db.delete(comments).where(eq(comments.postId, nestedPostId));
    await db.delete(posts).where(eq(posts.id, createdPostId));
    await db.delete(posts).where(eq(posts.id, nestedPostId));
    await db.delete(users).where(eq(users.email, "testuser@example.com"));
  });

  describe("POST /api/v1/posts", () => {
    it("should create a new post", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test Post", content: "This is a test post" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Test Post");
      expect(response.body.content).toBe("This is a test post");

      createdPostId = response.body.id;
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    it("should get a post by id", async () => {
      const response = await request(app)
        .get(`/api/v1/posts/${createdPostId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdPostId);
      expect(response.body.title).toBe("Test Post");
      expect(response.body.content).toBe("This is a test post");
    });

    it("should handle not found error", async () => {
      const id = uuidv4();
      const response = await request(app).get(`/api/v1/posts/${id}`).set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/posts", () => {
    it("should get all posts", async () => {
      const response = await request(app).get("/api/v1/posts").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((post: any) => post.id === createdPostId)).toBe(true);
    });
  });

  describe("POST /api/v1/posts/:id/comments", () => {
    it("should create a new comment for a post", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${createdPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "This is a test comment" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("This is a test comment");
      expect(response.body.postId).toBe(createdPostId);
    });

    it("should handle errors when creating a comment for non-existent post", async () => {
      const id = uuidv4();

      const response = await request(app)
        .post(`/api/v1/posts/${id}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "This comment should not be created" });

      expect(response.status).toBe(404);
    });
  });

  describe("Nested Comments", () => {
    it("should create a post for nested comments", async () => {
      const response = await request(app).post("/api/v1/posts").set("Authorization", `Bearer ${authToken}`).send({
        title: "Test Post for Comments",
        content: "This is a test post for nested comments",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      nestedPostId = response.body.id;
    });

    // Create first top-level comment
    it("should create the first top-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "First top-level comment" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("First top-level comment");
      expect(response.body.parentId).toBeNull();
      firstTopLevelCommentId = response.body.id;
    });

    // Create second top-level comment
    it("should create the second top-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Second top-level comment" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("Second top-level comment");
      expect(response.body.parentId).toBeNull();
      secondTopLevelCommentId = response.body.id;
    });

    // Create first second-level comment under the first top-level comment
    it("should create the first second-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "First second-level comment",
          parentId: firstTopLevelCommentId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("First second-level comment");
      expect(response.body.parentId).toBe(firstTopLevelCommentId);
      firstSecondLevelCommentId = response.body.id;
    });

    // Create second second-level comment under the first top-level comment
    it("should create the second second-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Second second-level comment",
          parentId: firstTopLevelCommentId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("Second second-level comment");
      expect(response.body.parentId).toBe(firstTopLevelCommentId);
      secondSecondLevelCommentId = response.body.id;
    });

    // Create first third-level comment under the first second-level comment
    it("should create the first third-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "First third-level comment",
          parentId: firstSecondLevelCommentId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("First third-level comment");
      expect(response.body.parentId).toBe(firstSecondLevelCommentId);
    });

    // Create second third-level comment under the first second-level comment
    it("should create the second third-level comment", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${nestedPostId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Second third-level comment",
          parentId: firstSecondLevelCommentId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.content).toBe("Second third-level comment");
      expect(response.body.parentId).toBe(firstSecondLevelCommentId);
    });

    // Retrieve the post and verify the order of comments
    it("should retrieve the post with nested comments in correct order", async () => {
      const response = await request(app)
        .get(`/api/v1/posts/${nestedPostId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", nestedPostId);
      expect(response.body).toHaveProperty("comments");
      expect(response.body.comments).toBeInstanceOf(Array);
      expect(response.body.comments.length).toBe(2); // Two top-level comments

      const comments = response.body.comments;

      // Check that top-level comments are in the correct order (oldest to newest)
      expect(comments[0]).toHaveProperty("content", "First top-level comment");
      expect(comments[1]).toHaveProperty("content", "Second top-level comment");

      // Check children of the first top-level comment
      const firstTopLevelComment = comments[0];
      expect(firstTopLevelComment).toHaveProperty("id", firstTopLevelCommentId);
      expect(firstTopLevelComment).toHaveProperty("children");
      expect(firstTopLevelComment.children).toBeInstanceOf(Array);
      expect(firstTopLevelComment.children.length).toBe(2); // Two second-level comments

      // Check that second-level comments are in the correct order
      const secondLevelComments = firstTopLevelComment.children;
      expect(secondLevelComments[0]).toHaveProperty("content", "First second-level comment");
      expect(secondLevelComments[1]).toHaveProperty("content", "Second second-level comment");

      // Check children of the first second-level comment
      const firstSecondLevelComment = secondLevelComments[0];
      expect(firstSecondLevelComment).toHaveProperty("id", firstSecondLevelCommentId);
      expect(firstSecondLevelComment).toHaveProperty("children");
      expect(firstSecondLevelComment.children).toBeInstanceOf(Array);
      expect(firstSecondLevelComment.children.length).toBe(2); // Two third-level comments

      // Check that third-level comments are in the correct order
      const thirdLevelComments = firstSecondLevelComment.children;
      expect(thirdLevelComments[0]).toHaveProperty("content", "First third-level comment");
      expect(thirdLevelComments[1]).toHaveProperty("content", "Second third-level comment");

      // Check that other comments have no children
      const secondSecondLevelComment = secondLevelComments[1];
      expect(secondSecondLevelComment).toHaveProperty("id", secondSecondLevelCommentId);
      expect(secondSecondLevelComment).toHaveProperty("children");
      expect(secondSecondLevelComment.children).toBeInstanceOf(Array);
      expect(secondSecondLevelComment.children.length).toBe(0);

      const secondTopLevelComment = comments[1];
      expect(secondTopLevelComment).toHaveProperty("id", secondTopLevelCommentId);
      expect(secondTopLevelComment).toHaveProperty("children");
      expect(secondTopLevelComment.children).toBeInstanceOf(Array);
      expect(secondTopLevelComment.children.length).toBe(0);
    });
  });
});
