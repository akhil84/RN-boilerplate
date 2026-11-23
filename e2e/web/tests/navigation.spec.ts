// REQ: app-init — responsive web navigation (sidebar ≥ 768px, menu below).
import { expect, test } from '@playwright/test';

import { signIn } from './helpers';

test.describe('responsive navigation', () => {
  test('wide screens show the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await signIn(page);

    await expect(page.getByTestId('nav-settings')).toBeVisible();
    await expect(page.getByTestId('web-nav-toggle')).toHaveCount(0);
  });

  test('narrow screens use a menu button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);

    const toggle = page.getByTestId('web-nav-toggle');
    await expect(page.getByTestId('nav-settings')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('nav-settings').click();

    await expect(page.getByTestId('settings-title')).toBeVisible();
    await expect(page.getByTestId('nav-settings')).toBeHidden();
  });
});
