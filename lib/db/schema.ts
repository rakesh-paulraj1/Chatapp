import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(), // 'user' or 'assistant'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  conversationId: text('conversation_id').notNull(), // To group messages in conversations
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert; 