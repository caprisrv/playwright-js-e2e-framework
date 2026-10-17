import { test, expect } from '@playwright/test';
import { URL } from 'node:url';
import { RestfulBookerBookingPage } from '../../pages/RestfulBookerBookingPage.js';
import { RestfulBookerApi } from '../../api/RestfulBookerApi.js';

test.use({ timezoneId: 'America/Phoenix' });

test(
  'customer can book a room',
  { tag: ['@regression'] },
  async ({ page, request }) => {
    const bookingPage = new RestfulBookerBookingPage(page);
    const bookingApi = new RestfulBookerApi(request);

    await page.clock.install({ time: new Date('2026-10-10T12:00:00-07:00') });
    await bookingPage.open();

    const selectedDates = { checkin: '2026-10-11', checkout: '2026-10-12' };
    await bookingPage.selectDates(selectedDates.checkin, selectedDates.checkout);
    await expect(bookingPage.getDisplayedDates()).resolves.toEqual({
      checkin: '11/10/2026',
      checkout: '12/10/2026',
    });

    const availabilityResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === '/api/room' && response.request().method() === 'GET';
    });
    await bookingPage.checkAvailability();
    const availabilityResponse = await availabilityResponsePromise;
    expect(availabilityResponse.ok(), `Availability API returned HTTP ${availabilityResponse.status()}`).toBeTruthy();

    const availabilityData = await availabilityResponse.json();
    expect(Array.isArray(availabilityData.rooms), 'Availability response should contain a rooms array').toBeTruthy();
    expect(availabilityData.rooms.length, 'At least one room should be available for the selected dates').toBeGreaterThan(0);
    const availableRooms = availabilityData.rooms.slice(0, 3);
    const selectedRoom = availableRooms[0];
    await bookingPage.waitForAvailabilityResults(
      availableRooms.map((room) => room.roomid),
      { checkin: selectedDates.checkin, checkout: selectedDates.checkout },
    );
    await bookingPage.selectRoomById(selectedRoom.roomid);

    await bookingPage.startReservation();

    await bookingPage.enterGuestDetails({
      firstName: 'Saurabh',
      lastName: 'Gupta',
      email: 'test@test.com',
      phone: '16026379861',
    });

    // Authenticate before creating a reservation so auth failure cannot leak a booking.
    await bookingApi.authenticate();

    let bookingId;
    let testError;
    let cleanupError;
    try {
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

      bookingId = bookingResponseBody.bookingid;
      expect(bookingId).toBeTruthy();

      const booking = await bookingApi.getBooking(bookingId);

      expect(booking.firstname).toBe('Saurabh');
      expect(booking.lastname).toBe('Gupta');
      expect(booking.roomid).toBe(selectedRoom.roomid);
      expect(booking.bookingdates.checkin).toBe(selectedDates.checkin);
      expect(booking.bookingdates.checkout).toBe(selectedDates.checkout);

      await expect(page.getByText('Booking Confirmed')).toBeVisible();
    } catch (error) {
      testError = error;
    }

    if (bookingId !== undefined) {
      try {
        await bookingApi.deleteBooking(bookingId);
      } catch (error) {
        cleanupError = error;
      }
    }

    if (testError) {
      if (cleanupError) {
        testError.cleanupErrors = [...(testError.cleanupErrors || []), cleanupError];
      }
      throw testError;
    }
    if (cleanupError) throw cleanupError;
  },
);
