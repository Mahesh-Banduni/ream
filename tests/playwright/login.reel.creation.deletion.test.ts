import { test, expect } from '@playwright/test';

test('sign in, create multiple reels, and delete them', async ({ page }) => {
  test.setTimeout(15 * 60 * 1000); // 15 minutes
  // ============================================================
  // LOGIN CREDENTIALS
  // ============================================================
  
  const email = `${process.env.USER_A_EMAIL}`;
  const password = `${process.env.USER_A_PASSWORD}`;

  // ============================================================
  // REEL TOPICS
  // ============================================================

  const reelTopics = [
    'Agentic Ecommerce Marketing',
    'AI Automation for Developers',
  ];

  // ============================================================
  // SIGN IN
  // ============================================================

  await page.goto(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/signin`);

  // Email
  await page.getByLabel('Email').fill(email);

  // Password
  await page.getByLabel('Password').fill(password);

  // Click Sign In
  await page.getByRole('button', { name: /sign in/i }).click();

  // ============================================================
  // VERIFY DASHBOARD
  // ============================================================

  await page.waitForURL('**/dashboard', {
    timeout: 15000,
  });
  
  // Verify dashboard
  await expect(
    page.getByRole('heading', { name: 'Dashboard Overview' })
  ).toBeVisible({
    timeout: 15000,
  });

  // ============================================================
  // NAVIGATE TO REELS
  // ============================================================

  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Reels' })
    .click();

  // ============================================================
  // CREATE REELS
  // ============================================================

  for (const title of reelTopics) {
    // Open Create Reel dialog
    await page
      .getByRole('button', { name: 'Add New Reel' })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Create New Reel' })
    ).toBeVisible();

    // ------------------------------------------------------------
    // Title
    // ------------------------------------------------------------

    await page.getByLabel('Title').fill(title);

    // ------------------------------------------------------------
    // Intended Audience
    // ------------------------------------------------------------

    await page
      .getByLabel('Intended Audience')
      .fill('Developers and marketers interested in ecommerce');

    // ------------------------------------------------------------
    // Keywords
    // ------------------------------------------------------------

    let keywordInput = page.getByPlaceholder(
      'Type keyword and press Enter'
    );

    await keywordInput.fill('AI & Automation');
    await keywordInput.press('Enter');

    await expect(
      page.getByText('#AI & Automation', { exact: true })
    ).toBeVisible();

    keywordInput = page.getByPlaceholder('Add another...');

    await keywordInput.fill('Tech');
    await keywordInput.press('Enter');

    await expect(
      page.getByText('#Tech', { exact: true })
    ).toBeVisible();

    await keywordInput.fill('Productivity');
    await keywordInput.press('Enter');

    await expect(
      page.getByText('#Productivity', { exact: true })
    ).toBeVisible();

    // ------------------------------------------------------------
    // Tone
    // ------------------------------------------------------------

    const toneDropdown = page.getByRole('combobox').nth(0);

    await toneDropdown.click();

    await page
      .getByText('Professional', { exact: true })
      .click();

    await expect(toneDropdown).toContainText('Professional');

    // ------------------------------------------------------------
    // Voice
    // ------------------------------------------------------------

    const voiceDropdown = page.getByRole('combobox').nth(1);

    await voiceDropdown.click();

    await page
      .getByRole('option', { name: /Shubh/ })
      .click();

    // ------------------------------------------------------------
    // Duration
    // ------------------------------------------------------------

    const durationDropdown = page.getByRole('combobox').nth(2);

    await durationDropdown.click();

    await page
      .getByRole('option', { name: /30/ })
      .click();

    await expect(durationDropdown).toContainText('30');

    // ------------------------------------------------------------
    // Verify Form
    // ------------------------------------------------------------

    await expect(
      page.getByLabel('Title')
    ).toHaveValue(title);

    await expect(
      page.getByLabel('Intended Audience')
    ).toHaveValue(
      'Developers and marketers interested in ecommerce'
    );

    await expect(
      page.getByText(/required/i)
    ).not.toBeVisible();

    // ------------------------------------------------------------
    // Create Reel
    // ------------------------------------------------------------

    await page
      .getByRole('button', { name: 'Create Reel' })
      .click();

    // Make sure validation errors are not shown
    await expect(
      page.getByText(/must be/i)
    ).not.toBeVisible();

    // Verify reel was created
    await expect(
          page.getByText(title, { exact: true })
        ).toBeVisible({
      timeout: 300000,
    });

    await page.goto(`${process.env.NEXT_PUBLIC_SERVER_URL}/client/dashboard/reels`);
  }

  // ============================================================
  // DELETE CREATED REELS
  // ============================================================

  for (const title of reelTopics) {
    const reelTitle = page.getByText(title, { exact: true });

    // Make sure the reel exists
    await expect(reelTitle).toBeVisible();

    // Get the reel container
    const reelContainer = reelTitle.locator('..');

    // Click Delete
    await reelContainer
      .getByRole('button', { name: /delete/i })
      .click();

    // ------------------------------------------------------------
    // Confirmation dialog
    // ------------------------------------------------------------

    const confirmDelete = page.getByRole('button', {
      name: /delete|confirm/i,
    });

    if (await confirmDelete.isVisible()) {
      await confirmDelete.click();
    }

    // ------------------------------------------------------------
    // Verify deletion
    // ------------------------------------------------------------

    await expect(
      page.getByText(title, { exact: true })
    ).not.toBeVisible();
  }
});
