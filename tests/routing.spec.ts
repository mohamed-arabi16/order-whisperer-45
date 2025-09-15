import { test, expect } from '@playwright/test';

test('navigating to /pos-access should result in a 404 page', async ({ page }) => {
  await page.goto('/pos-access');
  await expect(page.locator('h1')).toHaveText('404');
});
