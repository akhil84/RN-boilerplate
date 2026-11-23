import { expect, type Page } from '@playwright/test';

/** Demo credentials accepted by the in-app mock API (packages/features/src/mocks). */
export const DEMO = { email: 'demo@example.com', password: 'password' };

export async function signIn(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('sign-in-title')).toBeVisible();
  await page.getByTestId('sign-in-email').fill(DEMO.email);
  await page.getByTestId('sign-in-password').fill(DEMO.password);
  await page.getByTestId('sign-in-submit').click();
  await expect(page.getByTestId('home-title')).toBeVisible();
}
