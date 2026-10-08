import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useViewStore } from '../../store/view';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal difficulty control', () => {
  beforeEach(() => {
    useViewStore.setState({ view: 'home' });
  });

  it('is hidden on home, where the picker owns difficulty', () => {
    render(<SettingsModal open onClose={vi.fn()} />);
    expect(document.getElementById('difficultySelector')).toBeNull();
  });

  it('is shown in game', () => {
    useViewStore.setState({ view: 'game' });
    render(<SettingsModal open onClose={vi.fn()} />);
    expect(document.getElementById('difficultySelector')).not.toBeNull();
  });
});
