import { test, expect } from '../../fixtures/testFixtures.js';

test('user can remove a product from the cart', { tag: '@regression', }, async ({ productsPage, cartPage }) => {
  await productsPage.addBackpackToCart();
  await productsPage.openCart();

  await expect(cartPage.backpackItem).toBeVisible();

  await cartPage.removeBackpackFromCart();

  await expect(cartPage.backpackItem).toBeVisible();
});