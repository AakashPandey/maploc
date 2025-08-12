import { pgTable, uuid, text, timestamp, varchar, integer, pgEnum, primaryKey, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum for AuthRole
export const authRoleEnum = pgEnum("AuthRole", ["USER", "ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  role: authRoleEnum("role").notNull().default("USER"),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  id_token: text("id_token"),
  scope: text("scope"),
  session_state: text("session_state"),
  token_type: text("token_type"),
});

export const verificationToken = pgTable("verification_token", {
  identifier: text("identifier").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] })
}));

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});



// Relations

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  user: one(users, {
    fields: [locations.user_id],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  locations: many(locations),
}));
