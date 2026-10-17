import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage.js';
import { ProductsPage } from '../../../pages/ProductsPage.js';

test('user can log in successfully', { tag: '@regression', }, async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  await loginPage.open();

  await loginPage.login(
    process.env.E2E_USERNAME,
    process.env.E2E_PASSWORD,
  );

  await expect(productsPage.pageTitle).toBeVisible();
});
