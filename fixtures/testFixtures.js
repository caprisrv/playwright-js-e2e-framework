import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { CartPage } from '../pages/CartPage.js';

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.login(
      process.env.E2E_USERNAME,
      process.env.E2E_PASSWORD,
    );

    await use(page);
  },

  productsPage: async ({ loggedInPage }, use) => {
    await use(new ProductsPage(loggedInPage));
  },

  cartPage: async ({ loggedInPage }, use) => {
    await use(new CartPage(loggedInPage));
  },
});

export { expect };