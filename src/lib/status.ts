export enum RunStatus {
  QUEUED = "queued",
  RUNNING = "running",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled"
}

/**
 * Validates state transitions for Runs
 */
export function isValidRunTransition(current: string, next: string): boolean {
  const transitions: Record<string, string[]> = {
    [RunStatus.QUEUED]: [RunStatus.RUNNING, RunStatus.CANCELED],
    [RunStatus.RUNNING]: [RunStatus.SUCCEEDED, RunStatus.FAILED, RunStatus.CANCELED],
    [RunStatus.SUCCEEDED]: [], // Terminal
    [RunStatus.FAILED]: [],    // Terminal
    [RunStatus.CANCELED]: []   // Terminal
  };

  return transitions[current]?.includes(next) ?? false;
}

export function isTerminalStatus(status: string): boolean {
  return [RunStatus.SUCCEEDED, RunStatus.FAILED, RunStatus.CANCELED].includes(status as RunStatus);
}
