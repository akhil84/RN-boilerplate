// REQ: app-init — sign in, browse, change a preference and sign out on web.
import { expect, test } from '@playwright/test';

import { DEMO, signIn } from './helpers';

test.describe('auth journey @smoke', () => {
  test('signed-out users land on sign-in, even on a deep link', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByTestId('sign-in-title')).toBeVisible();
    await expect(page.getByTestId('sign-in-demo-hint')).toBeVisible();
  });

  test('validates the form before calling the API', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('sign-in-email').fill('not-an-email');
    await page.getByTestId('sign-in-submit').click();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Enter your password.')).toBeVisible();
  });

  test('shows the backend error for a wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('sign-in-email').fill(DEMO.email);
    await page.getByTestId('sign-in-password').fill('wrong');
    await page.getByTestId('sign-in-submit').click();

    await expect(page.getByTestId('sign-in-error')).toHaveText('Email or password is incorrect.');
  });

  test('signs in, sees items, switches theme and signs out', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId('home-item-1')).toBeVisible();

    await page.getByTestId('nav-settings').click();
    await expect(page.getByTestId('settings-title')).toBeVisible();
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByTestId('settings-theme-dark').click();
    await expect(page.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');

    await page.getByTestId('settings-sign-out').click();
    await expect(page.getByTestId('sign-in-title')).toBeVisible();
  });

  test('keeps the session across a reload', async ({ page }) => {
    await signIn(page);

    await page.reload();

    await expect(page.getByTestId('home-title')).toBeVisible();
    await expect(page.getByTestId('sign-in-title')).toHaveCount(0);
  });
});
