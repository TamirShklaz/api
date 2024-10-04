import { comments, posts, users } from "@/db/schema"; // Adjust this import path to your schema
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { db } from "@/db/drizzle";

async function seed() {
  console.log("Starting database seeding...");

  // Clear existing data
  await clearDatabase();

  // Create users
  const userIds = await createUsers();

  // Create posts
  const postIds = await createPosts(userIds);

  // Create comments with complex structure
  await createComplexCommentStructure(userIds, postIds[0]);

  console.log("Database seeding completed successfully!");
}

async function clearDatabase() {
  console.log("Clearing existing data from the database...");

  // Delete all comments
  await db.delete(comments);

  // Delete all posts
  await db.delete(posts);

  // Delete all users
  await db.delete(users);

  console.log("Database cleared successfully!");
}

async function createUsers() {
  console.log("Creating users...");
  const userIds: string[] = [];

  const usersData = [
    { name: "Alice Johnson", email: "alice@example.com", password: "password123" },
    { name: "Bob Smith", email: "bob@example.com", password: "password456" },
    { name: "Charlie Brown", email: "charlie@example.com", password: "password789" },
    { name: "Diana Prince", email: "diana@example.com", password: "password101" },
    { name: "Ethan Hunt", email: "ethan@example.com", password: "password202" },
  ];

  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      })
      .returning();
    userIds.push(user.id);
  }

  console.log(`Created ${userIds.length} users`);
  return userIds;
}

async function createPosts(userIds: string[]) {
  console.log("Creating posts...");
  const postIds: string[] = [];

  const postsData = [
    {
      title: "Discussion Thread",
      content: "This is a post to demonstrate complex comment structures.",
    },
    {
      title: "Another Post",
      content: "This is another post with no comments.",
    },
  ];

  for (let i = 0; i < postsData.length; i++) {
    const [post] = await db
      .insert(posts)
      .values({
        id: uuidv4(),
        title: postsData[i].title,
        content: postsData[i].content,
        userId: userIds[i % userIds.length],
      })
      .returning();
    postIds.push(post.id);
  }

  console.log(`Created ${postIds.length} posts`);
  return postIds;
}

async function createComplexCommentStructure(userIds: string[], postId: string) {
  console.log("Creating complex comment structure...");

  // Function to create a comment and return its ID
  async function createComment(sequence: string, userId: string, parentId: string | null = null) {
    const content = `Comment ${sequence}: Expected to appear at position ${sequence}`;
    const [comment] = await db
      .insert(comments)
      .values({
        id: uuidv4(),
        content,
        postId,
        userId,
        parentId,
      })
      .returning();
    return comment.id;
  }

  // Create top-level comments (oldest to newest)
  const comment1Id = await createComment("1", userIds[0]); // Alice
  const comment2Id = await createComment("2", userIds[1]); // Bob
  const comment3Id = await createComment("3", userIds[2]); // Charlie

  // Create second-level comments under comment 1
  const comment1_1Id = await createComment("1.1", userIds[1], comment1Id); // Bob
  const comment1_2Id = await createComment("1.2", userIds[2], comment1Id); // Charlie
  const comment1_3Id = await createComment("1.3", userIds[4], comment1Id); // Ethan

  // Create second-level comment under comment 2
  const comment2_1Id = await createComment("2.1", userIds[0], comment2Id); // Alice

  // Create third-level comments under comment 1.1
  const comment1_1_1Id = await createComment("1.1.1", userIds[2], comment1_1Id); // Charlie

  // Create third-level comment under comment 1.2
  const comment1_2_1Id = await createComment("1.2.1", userIds[3], comment1_2Id); // Diana

  // Create third-level comment under comment 2.1
  const comment2_1_1Id = await createComment("2.1.1", userIds[4], comment2_1Id); // Ethan

  // Create fourth-level comment under comment 1.1.1
  await createComment("1.1.1.1", userIds[0], comment1_1_1Id); // Alice

  // Create fourth-level comment under comment 1.2.1
  await createComment("1.2.1.1", userIds[1], comment1_2_1Id); // Bob

  // Create second-level comment under comment 3
  const comment3_1Id = await createComment("3.1", userIds[3], comment3Id); // Diana

  // Create third-level comment under comment 3.1
  await createComment("3.1.1", userIds[4], comment3_1Id); // Ethan

  console.log("Complex comment structure created successfully");
}

// Run the seed function
seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
