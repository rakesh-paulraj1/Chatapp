import {db } from '@/db/drizzle';
import { messages, type NewMessage } from './schema';
import { eq } from 'drizzle-orm';

export async function saveMessage(message: NewMessage) {
  return await db.insert(messages).values(message).returning();
}


export async function getMessagesByConversationId(conversationId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function createNewConversation() {
  const conversationId = crypto.randomUUID();
  return conversationId;
} 