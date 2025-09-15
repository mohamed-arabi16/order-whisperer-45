import { test, expect } from '@playwright/test';

const SUPABASE_URL = "https://ucgeyklejttuvuqlxrco.supabase.co";

test.describe('POS Translation', () => {
  test('should render the POS page in Arabic after switching language', async ({ page }) => {
    // Mock APIs
    await page.route(`${SUPABASE_URL}/rest/v1/tenants?slug=eq.premium-restaurant`, async (route) => {
      const json = [{ id: '1', name: 'Premium Restaurant', subscription_plan: 'premium', is_active: true, slug: 'premium-restaurant' }];
      return await route.fulfill({ status: 200, json });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, async (route) => {
      const json = [{ id: 'fake-profile-id', user_id: 'fake-user-id', role: 'super_admin', full_name: 'Test Admin' }];
      return await route.fulfill({ status: 200, json });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/pos_orders*`, async (route) => {
      return await route.fulfill({ status: 200, json: [] });
    });
    await page.route(`${SUPABASE_URL}/rest/v1/restaurant_tables*`, async (route) => {
        return await route.fulfill({ status: 200, json: [] });
    });

    // Set up fake session
    const fakeSession = {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      user: { id: 'fake-user-id', aud: 'authenticated', role: 'authenticated', email: 'test@example.com' },
    };
    await page.goto('/');
    await page.evaluate((session) => {
        localStorage.setItem('sb-ucgeyklejttuvuqlxrco-auth-token', JSON.stringify(session));
    }, fakeSession);

    // Start on the homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Switch to Arabic
    await page.getByRole('button', { name: 'EN' }).click();

    // Wait for language switch to apply
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl', { timeout: 10000 });

    // Navigate to the POS page
    await page.goto('/pos-system/premium-restaurant', { waitUntil: 'networkidle' });

    // Assert the page is in Arabic
    const heading = page.getByRole('heading', { name: 'نظام نقاط البيع' });
    await expect(heading).toBeVisible();
  });
});
