import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:5001');
vi.stubEnv('VITE_API_TOKEN', 'test-api-token');
vi.stubEnv('VITE_LENS_ID', 'test-lens-id');
vi.stubEnv('VITE_LENS_GROUP_ID', 'test-lens-group-id');
vi.stubEnv('VITE_REMOTE_API_SPEC_ID', 'test-remote-api-spec-id');
