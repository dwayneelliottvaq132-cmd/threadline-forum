import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const members = sqliteTable("members", {
  userId:text("user_id").primaryKey(), email:text("email").notNull(), displayName:text("display_name").notNull(),
  role:text("role").notNull().default("member"), status:text("status").notNull().default("active"),
  joinedAt:integer("joined_at").notNull(), lastSeenAt:integer("last_seen_at").notNull(),
}, t=>[index("idx_members_status").on(t.status),index("idx_members_last_seen").on(t.lastSeenAt)]);
export const categories = sqliteTable("categories", {
  id:text("id").primaryKey(), name:text("name").notNull().unique(), description:text("description").notNull().default(""),
  color:text("color").notNull().default("#6257e8"), position:integer("position").notNull().default(0),
  isActive:integer("is_active",{mode:"boolean"}).notNull().default(true), createdAt:integer("created_at").notNull(),
}, t=>[index("idx_categories_position").on(t.position)]);
export const posts = sqliteTable("posts", {
  id:text("id").primaryKey(), authorId:text("author_id").notNull().references(()=>members.userId), authorName:text("author_name").notNull(),
  categoryId:text("category_id"), categoryName:text("category_name").notNull(), title:text("title").notNull(), body:text("body").notNull(),
  status:text("status").notNull().default("published"), isPinned:integer("is_pinned",{mode:"boolean"}).notNull().default(false),
  likeCount:integer("like_count").notNull().default(0), replyCount:integer("reply_count").notNull().default(0),
  createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull(),
}, t=>[index("idx_posts_status_created").on(t.status,t.createdAt),index("idx_posts_category").on(t.categoryName),index("idx_posts_author").on(t.authorId)]);
export const replies = sqliteTable("replies", {
  id:text("id").primaryKey(), postId:text("post_id").notNull().references(()=>posts.id,{onDelete:"cascade"}),
  authorId:text("author_id").notNull().references(()=>members.userId), authorName:text("author_name").notNull(),
  body:text("body").notNull(), status:text("status").notNull().default("published"),
  createdAt:integer("created_at").notNull(), updatedAt:integer("updated_at").notNull(),
}, t=>[index("idx_replies_post_created").on(t.postId,t.createdAt),index("idx_replies_status").on(t.status)]);
export const reports = sqliteTable("reports", {
  id:text("id").primaryKey(), reporterId:text("reporter_id").notNull(), targetType:text("target_type").notNull(),
  targetId:text("target_id").notNull(), reason:text("reason").notNull(), status:text("status").notNull().default("open"),
  createdAt:integer("created_at").notNull(), resolvedAt:integer("resolved_at"),
}, t=>[index("idx_reports_status_created").on(t.status,t.createdAt),index("idx_reports_target").on(t.targetType,t.targetId)]);
