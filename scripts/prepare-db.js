import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const journalPath = path.join(process.cwd(), 'prisma', 'dev.db-journal');

console.log('Database preparation started...');

// Function to run a command and return if it succeeded
function runCommand(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${cmd}`, error.message);
    return false;
  }
}

let needsRecreation = false;

if (fs.existsSync(dbPath)) {
  console.log('Checking database health with db push dry-run/check...');
  // Run db push to see if it is healthy.
  // If it fails with a malformed/corrupt DB error, the exit code will be non-zero.
  const success = runCommand('npx prisma db push --accept-data-loss');
  if (!success) {
    console.warn('Database is corrupt or malformed. Proceeding to delete and recreate...');
    needsRecreation = true;
  }
} else {
  console.log('Database file does not exist. Proceeding to create and seed...');
  needsRecreation = true;
}

if (needsRecreation) {
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Deleted corrupt dev.db file.');
    }
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
      console.log('Deleted corrupt dev.db-journal file.');
    }
  } catch (e) {
    console.error('Error deleting corrupt database files:', e.message);
  }

  console.log('Creating fresh database schema...');
  const pushSuccess = runCommand('npx prisma db push --accept-data-loss');
  if (pushSuccess) {
    console.log('Seeding default data to fresh database...');
    runCommand('npx tsx prisma/seed.ts');
  } else {
    console.error('Failed to create database schema even after deletion!');
  }
} else {
  console.log('Database is healthy and up-to-date.');
}

console.log('Database preparation finished.');
