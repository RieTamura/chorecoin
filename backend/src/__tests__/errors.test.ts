import { describe, it, expect } from 'vitest';
import { ErrorCodes, ErrorMessages } from '../src/errors';

describe('Error Handling', () => {
  it('should have all required error codes', () => {
    expect(ErrorCodes.INVALID_TOKEN).toBeDefined();
    expect(ErrorCodes.EXPIRED_TOKEN).toBeDefined();
    expect(ErrorCodes.UNAUTHORIZED).toBeDefined();
    expect(ErrorCodes.MISSING_TOKEN).toBeDefined();
    expect(ErrorCodes.INVALID_INPUT).toBeDefined();
    expect(ErrorCodes.MISSING_FIELD).toBeDefined();
    expect(ErrorCodes.INVALID_EMAIL).toBeDefined();
    expect(ErrorCodes.NOT_FOUND).toBeDefined();
    expect(ErrorCodes.FORBIDDEN).toBeDefined();
    expect(ErrorCodes.CONFLICT).toBeDefined();
    expect(ErrorCodes.INSUFFICIENT_POINTS).toBeDefined();
    expect(ErrorCodes.INVALID_OPERATION).toBeDefined();
    expect(ErrorCodes.DATABASE_ERROR).toBeDefined();
    expect(ErrorCodes.INTERNAL_SERVER_ERROR).toBeDefined();
  });

  it('should have error messages for all codes', () => {
    Object.values(ErrorCodes).forEach((code) => {
      expect(ErrorMessages[code]).toBeDefined();
      expect(typeof ErrorMessages[code]).toBe('string');
    });
  });

  it('error messages should be in Japanese', () => {
    const sampleMessages = [
      ErrorMessages[ErrorCodes.UNAUTHORIZED],
      ErrorMessages[ErrorCodes.NOT_FOUND],
      ErrorMessages[ErrorCodes.INVALID_INPUT],
    ];

    // Check if messages contain Japanese characters
    const japaneseCharPattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
    sampleMessages.forEach((message) => {
      expect(message).toMatch(japaneseCharPattern);
    });
  });
});
