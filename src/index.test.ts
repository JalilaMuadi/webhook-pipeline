import { describe, it, expect } from 'vitest';

describe('CI Pipeline Verification', () => {
  it('should pass this dummy test to confirm environment setup', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });
});