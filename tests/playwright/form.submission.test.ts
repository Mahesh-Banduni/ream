import { test, expect } from '@playwright/test';

// test.beforeEach(async ({ page }) => {
//   await page.goto('http://localhost:3000/dashboard');
// });

test('fill create reel form', async ({ page }) => {
  await page.goto(`${process.env.NEXT_PUBLIC_SERVER_URL}/client/dashboard`);

  await expect(
    page.getByRole('heading', { name: 'Dashboard Overview' })
  ).toBeVisible();

  // Navigate to Reels page
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Reels' })
    .click();

  // Open Create Reel dialog
  await page.getByRole('button', { name: 'Add New Reel' }).click();

  await expect(
    page.getByRole('heading', { name: 'Create New Reel' })
  ).toBeVisible();

  // Fill Title
  await page.getByLabel('Title').fill('Agentic Ecommerce Marketing');

  // Fill Intended Audience
  await page
    .getByLabel('Intended Audience')
    .fill('Developers and marketers interested in ecommerce');

  // Add Keyword
  let keywordInput = page.getByPlaceholder('Type keyword and press Enter');

  await keywordInput.fill('AI & Automation');
  await keywordInput.press('Enter');

  await expect(page.getByText('#AI & Automation')).toBeVisible();

  keywordInput = page.getByPlaceholder('Add another...');
  await keywordInput.fill('Tech');
  await keywordInput.press('Enter');

  await expect(page.getByText('#Tech')).toBeVisible();

  await keywordInput.fill('Productivity');
  await keywordInput.press('Enter');

  await expect(page.getByText('#Productivity')).toBeVisible();
  // -------------------------------
  // Tone Selection (Custom Dropdown)
  // -------------------------------
  const toneDropdown = page.getByRole('combobox').nth(0);

  await toneDropdown.click();
  await page.getByText('Professional', { exact: true }).click();

  await expect(toneDropdown).toContainText('Professional');

  // -------------------------------
  // Voice Selection (Custom Dropdown)
  // -------------------------------
  const voiceDropdown = page.getByRole('combobox').nth(1);

  await voiceDropdown.click();

    await page
    .getByRole('option', {
      name: /Shubh/
    })
    .click();

  // await expect(voiceDropdown).toContainText('shubh');

  // -------------------------------
  // Duration Selection (Custom Dropdown)
  // -------------------------------
  const durationDropdown = page.getByRole('combobox').nth(2);

  await durationDropdown.click();
  await page
    .getByRole('option', {
      name: /30/
    })
    .click();

  await expect(durationDropdown).toContainText('30');

  // Verify text fields
  await expect(page.getByLabel('Title')).toHaveValue(
    'Agentic Ecommerce Marketing'
  );

  await expect(page.getByLabel('Intended Audience')).toHaveValue(
    'Developers and marketers interested in ecommerce'
  );

  await expect(page.getByText(/required/i)).not.toBeVisible();

  // Optional: Submit the form
  await page.getByRole('button', { name: 'Create Reel' }).click();

  await expect(page.getByText(/must be/i)).not.toBeVisible();
});