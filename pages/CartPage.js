import { BasePage } from './BasePage.js';

export class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.backpackItem = page.getByText('Sauce Labs Backpack', {
      exact: true,
    });

    this.backpackRemoveButton = page.locator('#remove-sauce-labs-backpack');
  }

  async removeBackpackFromCart() {
    await this.backpackRemoveButton.click();
  }
}
