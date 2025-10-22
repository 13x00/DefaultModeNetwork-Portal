import { NextResponse } from 'next/server';
import { readMessages, writeMessages, archivePastDays } from '@/lib/fsdb';

export async function POST() {
  try {
    const messages = await readMessages();
    const { kept } = await archivePastDays(messages);
    await writeMessages(kept);
    
    return NextResponse.json({ 
      success: true, 
      archived: messages.length - kept.length,
      kept: kept.length 
    });
  } catch (error) {
    console.error('Error archiving messages:', error);
    return NextResponse.json({ error: 'Failed to archive messages' }, { status: 500 });
  }
}
