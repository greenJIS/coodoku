import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { modalStack } from '../hooks/modalStack';

afterEach(() => {
  cleanup();
  modalStack.clear();
});
