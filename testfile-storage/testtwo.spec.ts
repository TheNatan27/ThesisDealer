/* eslint-disable node/no-unpublished-import */
import {test, expect} from '@playwright/test';

test('get started link', async ({page}) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', {name: 'Get started'}).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*intro/);
});
