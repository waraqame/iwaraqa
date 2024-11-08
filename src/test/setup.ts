import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { db } from '../lib/db';

expect.extend(matchers);

// Reset database before each test
beforeEach(async () => {
  await db.reset();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});