import { log } from 'node:console';
import { URL } from 'node:url';
import { expect, test } from '@playwright/test';
import { RestfulBookerBookingPage } from '../../pages/RestfulBookerBookingPage.js';

test.use({ timezoneId: 'America/Phoenix' });

test('availability request preserves the selected calendar dates', { tag: '@regression' }, async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-19T19:30:00-07:00') });

  const bookingPage = new RestfulBookerBookingPage(page);
  await bookingPage.open();
  await bookingPage.selectDates('2026-10-20', '2026-10-22');

  const displayedDates = await bookingPage.getDisplayedDates();
  const availabilityRequestPromise = page.waitForRequest((request) => {
    const requestUrl = new URL(request.url());
    return request.method() === 'GET' && requestUrl.pathname === '/api/room';
  });

  await bookingPage.checkAvailability();

  const availabilityRequest = await availabilityRequestPromise;
  const availabilityUrl = new URL(availabilityRequest.url());
  const availabilityDates = {
    checkin: availabilityUrl.searchParams.get('checkin'),
    checkout: availabilityUrl.searchParams.get('checkout'),
  };

  const availabilityResponse = await availabilityRequest.response();
  expect(availabilityResponse?.ok()).toBe(true);
  const availabilityData = await availabilityResponse.json();
  const availableRoomIds = availabilityData.rooms.slice(0, 3).map((room) => room.roomid);
  await bookingPage.waitForAvailabilityResults(availableRoomIds);

  const bookingLinkUrls = await bookingPage.getBookingLinkUrls();
  const bookingLinkDates = bookingLinkUrls.map((url) => {
    const bookingUrl = new URL(url);
    return {
      url,
      checkin: bookingUrl.searchParams.get('checkin'),
      checkout: bookingUrl.searchParams.get('checkout'),
    };
  });

  log(
    'Captured date values:',
    JSON.stringify({ displayedDates, availabilityDates, bookingLinkDates }, null, 2),
  );

  expect(displayedDates).toEqual({ checkin: '20/10/2026', checkout: '22/10/2026' });
  expect(bookingLinkDates.length).toBeGreaterThan(0);
  for (const dates of bookingLinkDates) {
    expect(dates.checkin).toBe('2026-10-20');
    expect(dates.checkout).toBe('2026-10-22');
  }
});
