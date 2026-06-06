import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a deterministic idempotency key for an action execution
 */
export function generateIdempotencyKey(actionId: string, actorId: string, input: any): string {
  const inputStr = JSON.stringify(input);
  // In a real app, you might hash this. For simplicity, we use unique ID or composite string
  // but the prompt implies we should check it in database.
  // Actually, client should generate this and store it.
  return `idemp-${actionId}-${actorId}-${btoa(inputStr).slice(0, 32)}`;
}

export function isValidIdempotencyKey(key: string): boolean {
  return typeof key === 'string' && key.startsWith('idemp-');
}
