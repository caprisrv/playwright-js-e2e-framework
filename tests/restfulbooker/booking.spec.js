import { test, expect } from '@playwright/test';
import { RestfulBookerBookingPage } from '../../pages/RestfulBookerBookingPage.js';
import { RestfulBookerApi } from '../../api/RestfulBookerApi.js';

test(
  'customer can book a room',
  { tag: '@regression' },
  async ({ page, request }) => {
  const bookingPage = new RestfulBookerBookingPage(page);
  const bookingApi = new RestfulBookerApi(request);

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

  let bookingId;    
  try {
    bookingId = bookingResponseBody.bookingid;

    await bookingApi.authenticate();
    const booking = await bookingApi.getBooking(bookingId);

    expect(booking.firstname).toBe('Saurabh');
    expect(booking.lastname).toBe('Gupta');
    expect(booking.roomid).toBe(2);
    expect(booking.bookingdates.checkin).toBe('2026-10-11');
    expect(booking.bookingdates.checkout).toBe('2026-10-12');

    await expect(page.getByText('Booking Confirmed')).toBeVisible();
  } finally {
    await bookingApi.deleteBooking(bookingId);
  }
});