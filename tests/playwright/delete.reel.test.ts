import { test, expect } from '@playwright/test';

test('delete reel', async ({ page }) => {
  await page.goto(`${process.env.NEXT_PUBLIC_SERVER_URL}/client/dashboard/reels`);
  await expect(
    page.getByRole('heading', { name: 'Reels'})
  ).toBeVisible();

  const reelLink = page.locator('a[href^="/dashboard/reels/"]').first();

  await Promise.all([
      page.waitForURL(/\/dashboard\/reels\/.+/),
      reelLink.click(),
  ]);

  await expect(page).toHaveURL(/\/dashboard\/reels\/.+/);
  
  await expect(
    page.getByRole('heading', { name: 'Agentic Ecommerce Marketing'})
  ).toBeVisible();

  // Wait for details page
  await expect(page.getByRole('button', {
    name: 'Delete Reel'
  })).toBeVisible();

  // Open delete confirmation
  await page.getByRole('button', {
    name: 'Delete Reel'
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Delete Reel'})
  ).toBeVisible();

  // Confirm delete
  await page.getByRole('button', {
    name: 'Yes, Delete'
  }).click();

});