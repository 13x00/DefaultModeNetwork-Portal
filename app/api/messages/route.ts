import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { readMessages, writeMessages, archivePastDays, PortalMessage } from '@/lib/fsdb';
import { sanitize } from '@/lib/sanitize';

// Simple in-memory rate limiting (per process)
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_MS = 5000; // 5 seconds

export async function GET() {
  try {
    const messages = await readMessages();
    
    // Archive past days and get only today's messages
    const { kept } = await archivePastDays(messages);
    await writeMessages(kept);
    
    return NextResponse.json({ messages: kept });
  } catch (error) {
    console.error('Error reading messages:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Sanitize and validate
    const sanitizedText = sanitize(text);
    
    if (sanitizedText.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }
    
    if (sanitizedText.length > 160) {
      return NextResponse.json({ error: 'Message too long (max 160 characters)' }, { status: 400 });
    }
    
    // Rate limiting - check for duplicate text within last 5 seconds
    const now = Date.now();
    const recentKey = sanitizedText.toLowerCase();
    const lastSubmission = recentSubmissions.get(recentKey);
    
    if (lastSubmission && (now - lastSubmission) < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Please wait before submitting the same message again' }, { status: 429 });
    }
    
    // Update rate limit
    recentSubmissions.set(recentKey, now);
    
    // Clean up old rate limit entries (keep only last 100 entries)
    if (recentSubmissions.size > 100) {
      const entries = Array.from(recentSubmissions.entries());
      const cutoff = now - RATE_LIMIT_MS;
      recentSubmissions.clear();
      entries
        .filter(([_, timestamp]) => timestamp > cutoff)
        .forEach(([key, timestamp]) => recentSubmissions.set(key, timestamp));
    }
    
    // Create new message
    const newMessage: PortalMessage = {
      id: nanoid(),
      text: sanitizedText,
      createdAt: now,
    };
    
    // Read current messages, archive past days, and add new message
    const messages = await readMessages();
    const { kept } = await archivePastDays(messages);
    const updatedMessages = [...kept, newMessage];
    
    // Write back to file
    await writeMessages(updatedMessages);
    
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
