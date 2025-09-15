import { test, expect } from '@playwright/test';

const SUPABASE_URL = "https://ucgeyklejttuvuqlxrco.supabase.co";

test.describe('POS Access Control', () => {
  test('should redirect to POS system for premium tenants', async ({ page }) => {
    await page.route(`${SUPABASE_URL}/rest/v1/tenants*`, async (route) => {
      const url = route.request().url();
      if (url.includes('slug=eq.premium-restaurant')) {
        const json = { id: '1', name: 'Premium Restaurant', subscription_plan: 'premium', is_active: true };
        return await route.fulfill({ status: 200, json });
      }
      await route.continue();
    });

    await page.goto('/pos-access/premium-restaurant');
    await expect(page).toHaveURL(/.*pos-system/);
  });

  test('should show upgrade prompt for non-premium tenants', async ({ page }) => {
    await page.route(`${SUPABASE_URL}/rest/v1/tenants*`, async (route) => {
      const url = route.request().url();
      if (url.includes('slug=eq.basic-restaurant')) {
        const json = { id: '2', name: 'Basic Restaurant', subscription_plan: 'basic', is_active: true };
        return await route.fulfill({ status: 200, json });
      }
      await route.continue();
    });

    await page.goto('/pos-access/basic-restaurant');
    await expect(page.locator('h3:has-text("POS System access requires Premium subscription")')).toBeVisible();
  });
});

test.describe('Contact Form', () => {
  test('should allow submitting the form multiple times and reset the form', async ({ page }) => {
    await page.route('**/submit-contact-form', async (route) => {
      await route.fulfill({ status: 200, json: { success: true } });
    });

    await page.goto('/contact');
    await expect(page.locator('.animate-spin')).not.toBeVisible();

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message.');
    await page.click('button[type="submit"]');
    await page.waitForResponse('**/submit-contact-form');

    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');

    await page.fill('input[name="name"]', 'Test User 2');
    await page.fill('input[name="email"]', 'test2@example.com');
    await page.fill('textarea[name="message"]', 'This is another test message.');
    await page.click('button[type="submit"]');
    await page.waitForResponse('**/submit-contact-form');

    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });
});
