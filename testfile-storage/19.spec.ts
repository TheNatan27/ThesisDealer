// eslint-disable-next-line node/no-unpublished-import
import {test, expect} from '@playwright/test';

test.describe('Example test', () => {
  test('should allow me to add todo items', async ({page}) => {
    console.log('This is test 01');
    const ipAddress = process.env.IP_ADDRESS || '192.168.100.8';

    //await page.waitForTimeout(5_000);

    await page.goto('http://localhost:5000/user/read/2');

    await expect(page).toHaveURL('http://localhost:5000/user/read/2');
  });
});
