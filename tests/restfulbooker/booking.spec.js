import { test, expect } from '@playwright/test';
import { RestfulBookerBookingPage } from '../../pages/RestfulBookerBookingPage.js';

test('customer can book a room', async ({ page, request }) => {
  const bookingPage = new RestfulBookerBookingPage(page);

  await bookingPage.open();

  await bookingPage.selectDates('2026-10-11', '2026-10-12');

  await bookingPage.checkAvailability();

  await bookingPage.selectRoom('Double');

  await bookingPage.startReservation();

  await bookingPage.enterGuestDetails({
    firstName: 'Saurabh',
    lastName: 'Gupta',
    email: 'test@test.com',
    phone: '16026379861',
  });

  const bookingResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/booking') && response.request().method() === 'POST',
  );

  await bookingPage.reserve();

  const bookingResponse = await bookingResponsePromise;

  const bookingResponseStatus = bookingResponse.status();
  const bookingResponseBody = await bookingResponse.json();

  expect(
    bookingResponse.ok(),
    `Booking API returned HTTP ${bookingResponseStatus}: ${JSON.stringify(bookingResponseBody)}`,
  ).toBeTruthy();

  expect(bookingResponseBody).toHaveProperty('bookingid');

  let token;
  let bookingId;    
  try {
    bookingId = bookingResponseBody.bookingid;

    const authResponse = await request.post('https://automationintesting.online/api/auth/login', {
      data: {
        username: 'admin',
        password: 'password',
      },
    });

    expect(authResponse.ok()).toBeTruthy();

    const authResponseBody = await authResponse.json();

    expect(authResponseBody).toHaveProperty('token');

    token = authResponseBody.token;

    const getBookingResponse = await request.get(
      `https://automationintesting.online/api/booking/${bookingId}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );

    expect(
      getBookingResponse.ok(),
      `GET booking returned HTTP ${getBookingResponse.status()}`,
    ).toBeTruthy();

    const getBookingResponseBody = await getBookingResponse.json();

    expect(getBookingResponseBody.firstname).toBe('Saurabh');
    expect(getBookingResponseBody.lastname).toBe('Gupta');
    expect(getBookingResponseBody.roomid).toBe(2);
    expect(getBookingResponseBody.bookingdates.checkin).toBe('2026-10-11');
    expect(getBookingResponseBody.bookingdates.checkout).toBe('2026-10-12');

    await expect(page.getByText('Booking Confirmed')).toBeVisible();
  } finally {
    const deleteBookingResponse = await request.delete(
      `https://automationintesting.online/api/booking/${bookingId}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );

    expect(
      deleteBookingResponse.ok(),
      `DELETE booking returned HTTP ${deleteBookingResponse.status()}`,
    ).toBeTruthy();
  }
});