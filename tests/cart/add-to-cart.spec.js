import { test, expect } from '../../fixtures/testFixtures.js';

test('user can add a product to the cart', async ({ productsPage, cartPage }) => {
  await productsPage.addBackpackToCart();
  await productsPage.openCart();

  await expect(cartPage.backpackItem).toBeVisible();
});