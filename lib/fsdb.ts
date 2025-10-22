import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export type PortalMessage = {
  id: string;        // nanoid
  text: string;      // 1..160 chars after trim
  createdAt: number; // epoch ms
};

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const MESSAGES_BACKUP = path.join(DATA_DIR, 'messages.bak.json');
const MESSAGES_TEMP = path.join(DATA_DIR, 'messages.tmp.json');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archive');

// Simple mutex to serialize write operations
let writeQueue = Promise.resolve();

export async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
}

export async function readMessages(): Promise<PortalMessage[]> {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to read messages.json, trying backup:', error);
    try {
      const data = await fs.readFile(MESSAGES_BACKUP, 'utf-8');
      return JSON.parse(data);
    } catch (backupError) {
      console.warn('Failed to read backup, initializing with empty array:', backupError);
      return [];
    }
  }
}

export async function writeMessages(messages: PortalMessage[]): Promise<void> {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue.then(async () => {
      try {
        await ensureDirs();
        
        // Sort messages by creation time
        const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);
        
        // Write to temp file first
        await fs.writeFile(MESSAGES_TEMP, JSON.stringify(sortedMessages, null, 2));
        
        // Atomic rename
        await fs.rename(MESSAGES_TEMP, MESSAGES_FILE);
        
        // Create backup
        await fs.copyFile(MESSAGES_FILE, MESSAGES_BACKUP);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function archivePastDays(messages: PortalMessage[]): Promise<{ kept: PortalMessage[] }> {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  const toArchive: { [date: string]: PortalMessage[] } = {};
  const kept: PortalMessage[] = [];
  
  for (const message of messages) {
    const messageDate = new Date(message.createdAt);
    const messageDayStart = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate()).getTime();
    
    if (messageDayStart < todayStart) {
      const dateKey = messageDate.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!toArchive[dateKey]) {
        toArchive[dateKey] = [];
      }
      toArchive[dateKey].push(message);
    } else {
      kept.push(message);
    }
  }
  
  // Write archived messages to their respective files
  for (const [date, archivedMessages] of Object.entries(toArchive)) {
    const archiveFile = path.join(ARCHIVE_DIR, `${date}.json`);
    
    try {
      // Read existing archive if it exists
      let existingArchive: PortalMessage[] = [];
      try {
        const data = await fs.readFile(archiveFile, 'utf-8');
        existingArchive = JSON.parse(data);
      } catch {
        // File doesn't exist, start with empty array
      }
      
      // Append new messages and sort
      const combinedArchive = [...existingArchive, ...archivedMessages]
        .sort((a, b) => a.createdAt - b.createdAt);
      
      await fs.writeFile(archiveFile, JSON.stringify(combinedArchive, null, 2));
    } catch (error) {
      console.error(`Failed to write archive for ${date}:`, error);
    }
  }
  
  return { kept };
}

// No seeding - start with empty messages by default
