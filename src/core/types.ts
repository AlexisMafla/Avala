export type Country = "ES" | "CO" | "AR";

export interface ValidationResult {
  valid: boolean;
  /** Normalized/canonical form of the input when it can be derived. */
  normalized?: string;
  /** Machine-readable reason when invalid. */
  reason?: string;
  /** Extra structured details specific to each validator. */
  details?: Record<string, unknown>;
}

export const INVALID_FORMAT = "invalid_format";
export const INVALID_CHECKSUM = "invalid_checksum";
export const UNSUPPORTED = "unsupported";
