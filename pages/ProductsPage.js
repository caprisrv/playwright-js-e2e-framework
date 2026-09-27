import { BasePage } from './BasePage.js';

export class ProductsPage extends BasePage {
    constructor(page) {
        super(page);

        this.pageTitle = page.getByText('Swag Labs');
        this.backpackAddToCartButton = page.locator('#add-to-cart-sauce-labs-backpack');
        this.cartLink = page.locator('#shopping_cart_container');
    }

    async addBackpackToCart() {
    await this.backpackAddToCartButton.click();
  }

  async openCart() {
    await this.cartLink.click();
  }
}