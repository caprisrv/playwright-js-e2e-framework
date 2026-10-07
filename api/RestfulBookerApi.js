export class RestfulBookerApi {
  constructor(request) {
    this.request = request;
    this.baseUrl = 'https://automationintesting.online';
    this.token = null;
  }

  async authenticate() {
    const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
      data: {
        username: process.env.RESTFUL_BOOKER_USERNAME,
        password: process.env.RESTFUL_BOOKER_PASSWORD,
      },
    });

    if (!response.ok()) {
      throw new Error(`API authentication failed with HTTP ${response.status()}`);
    }

    const responseBody = await response.json();

    if (!responseBody.token) {
      throw new Error('API authentication response did not contain a token');
    }

    this.token = responseBody.token;

    return this.token;
  }

  async getBooking(bookingId) {
    if (!this.token) {
      throw new Error('API client is not authenticated');
    }

    const response = await this.request.get(`${this.baseUrl}/api/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${this.token}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to retrieve booking ${bookingId}: HTTP ${response.status()}`);
    }

    return response.json();
  }

  async deleteBooking(bookingId) {
    if (!this.token) {
      throw new Error('API client is not authenticated');
    }

    const response = await this.request.delete(`${this.baseUrl}/api/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${this.token}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to delete booking ${bookingId}: HTTP ${response.status()}`);
    }
  }
}
