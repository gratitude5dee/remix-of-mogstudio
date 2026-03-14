import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  FloraModelMarketplace,
  type FloraModelMarketplaceValue,
} from './FloraModelMarketplace';

describe('FloraModelMarketplace', () => {
  it('renders a two-panel provider flyout and switches providers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value: FloraModelMarketplaceValue = {
      auto: false,
      selectedModelIds: ['google/gemini-2.5-flash'],
      useMultipleModels: false,
    };

    render(
      <FloraModelMarketplace
        mediaType="text"
        value={value}
        onChange={onChange}
        triggerVariant="toolbar"
      />
    );

    await user.click(screen.getByRole('button', { name: /gemini 2\.5 flash/i }));

    expect(screen.getByText('Providers')).toBeInTheDocument();
    expect(screen.getByText('Featured Models')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lovable 4 models/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Lovable').length).toBeGreaterThan(0);
      expect(screen.getByText('GPT-5 Mini')).toBeInTheDocument();
    });
  });
});
