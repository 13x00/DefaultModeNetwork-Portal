import { NextResponse } from 'next/server';
import { writeMessages } from '@/lib/fsdb';

export async function POST() {
  try {
    // Clear all messages by writing an empty array
    await writeMessages([]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'All messages cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    return NextResponse.json(
      { error: 'Failed to clear messages' }, 
      { status: 500 }
    );
  }
}
