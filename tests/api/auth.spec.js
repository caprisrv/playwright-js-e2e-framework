import { test, expect } from '@playwright/test';

test('can authenticate through the API', async ({ request }) => {
  const response = await request.post('https://automationintesting.online/api/auth/login', {
    data: {
      username: 'admin',
      password: 'password',
    },
  });

  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();

  expect(responseBody).toHaveProperty('token');

  const bookingResponse = await request.post('https://automationintesting.online/api/booking/', {
    headers: {
      Cookie: `token=${responseBody.token}`,
    },
    data: {
      roomid: 1,
      firstname: 'Playwright',
      lastname: 'Phase2',
      depositpaid: true,
      email: 'playwright@example.com',
      phone: '07123456789',
      bookingdates: {
        checkin: '2026-11-01',
        checkout: '2026-11-03',
      },
    },
  });

  expect(bookingResponse.ok()).toBeTruthy();

  const bookingResponseBody = await bookingResponse.json();

  expect(bookingResponseBody).toHaveProperty('bookingid');

  const bookingId = bookingResponseBody.bookingid;

const getBookingResponse = await request.get(
  `https://automationintesting.online/api/booking/${bookingId}`,
  {
    headers: {
      Cookie: `token=${responseBody.token}`,
    },
  },
);

expect(getBookingResponse.ok()).toBeTruthy();

const getBookingResponseBody = await getBookingResponse.json();

expect(getBookingResponseBody.firstname).toBe('Playwright');
expect(getBookingResponseBody.lastname).toBe('Phase2');
});
