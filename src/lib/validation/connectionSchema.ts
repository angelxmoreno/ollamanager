import type { ConnectionDraft } from "../../types/connections";

const domainPattern = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)*[A-Za-z0-9-]{1,63}$/;

export interface ConnectionValidationIssue {
  field: keyof ConnectionDraft;
  message: string;
}

export interface ConnectionValidationFailure {
  success: false;
  issues: ConnectionValidationIssue[];
}

export interface ConnectionValidationSuccess {
  success: true;
  data: ConnectionDraft;
}

export type ConnectionValidationResult = ConnectionValidationFailure | ConnectionValidationSuccess;

const normalizeString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const isValidIPv4 = (value: string): boolean => {
  const segments = value.split(".");
  if (segments.length !== 4) {
    return false;
  }

  return segments.every((segment) => {
    if (!/^\d{1,3}$/.test(segment)) {
      return false;
    }

    const parsed = Number(segment);
    return parsed >= 0 && parsed <= 255;
  });
};

const isValidHost = (value: string): boolean => value === "localhost" || domainPattern.test(value) || isValidIPv4(value);

export const validateConnection = (input: Partial<ConnectionDraft>): ConnectionValidationResult => {
  const candidate: ConnectionDraft = {
    name: normalizeString(input.name),
    protocol: input.protocol === "https" ? "https" : "http",
    host: normalizeString(input.host),
    port: Number(input.port),
    notes: normalizeString(input.notes),
    isFavorite: Boolean(input.isFavorite),
  };

  const issues: ConnectionValidationIssue[] = [];

  if (candidate.name.length < 2 || candidate.name.length > 60) {
    issues.push({ field: "name", message: "Name must be between 2 and 60 characters." });
  }

  if (!isValidHost(candidate.host) || candidate.host.length > 255) {
    issues.push({ field: "host", message: "Host must be localhost, a valid hostname, or IPv4 address." });
  }

  if (!Number.isInteger(candidate.port) || candidate.port < 1 || candidate.port > 65535) {
    issues.push({ field: "port", message: "Port must be an integer between 1 and 65535." });
  }

  if (candidate.notes.length > 500) {
    issues.push({ field: "notes", message: "Notes must be at most 500 characters." });
  }

  if (issues.length > 0) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: candidate,
  };
};
