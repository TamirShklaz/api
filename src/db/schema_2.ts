//THIS WAS THE SCHEMA DESIGNED IN THE INTERVIEW WITH KAT

import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const locations = pgEnum("locations", ["New York", "SF"]);
export const companyTypes = pgEnum("company_types", ["remote", "in-person", "hybrid"]);
export const workTypes = pgEnum("work_types", ["full-time", "part-time", "contract", "internship"]);
export const applicationStatus = pgEnum("application_status", ["invited", "pending", "accepted", "rejected"]);
export const stage = pgEnum("application_status", ["seed", "series_a", "series_b"]);
export const tags = pgEnum("tags", [
  "full_stack",
  "backend",
  "frontend",
  "mobile",
  "devops",
  "data",
  "design",
  "product",
]);

export const companyStatus = pgEnum("company_status", ["pending", "approved"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

// b-tree index on created at deleted at
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  companyTypes: companyTypes("company_types").notNull(),
  stage: stage("stage").notNull(),
  status: companyStatus("status").notNull(),
});

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
});

export const listing = pgTable("listing", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  //
  minPayRange: integer("price").notNull(),
  maxPayRange: integer("price").notNull(),
  location: locations("location").notNull(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  workType: workTypes("work_types").notNull(),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  linkedInUrl: text("linkedin_url"),
  yearsOfExperience: integer("years_of_experience").notNull(),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listing.id, { onDelete: "cascade" }),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  videoUrl: text("video_url"),
  cv_url: text("cv_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applicationStatuses = pgTable("application_statuses", {
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  status: applicationStatus("status").notNull(),
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const listingSkills = pgTable("listing_skills", {
  listingId: uuid("listing_id").references(() => listing.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const candidateSkills = pgTable("candidate_skills", {
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "cascade" }),
});

export const candidateCompanies = pgTable("candidate_companies", {
  candidateId: uuid("candidate_id").references(() => candidates.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
});

// How do I find jobs as a candidate?
// Type, in person, remote
// State, series A, B
// Pay range
// Location, New York, SF
// Title

// How do I filter candidates
// Skills
// Seniority level
// Past companies
// Schools

// KPIS
// North star: landed jobs
// Secondary: number of applications, number of candidates, number of companies, number of listings
