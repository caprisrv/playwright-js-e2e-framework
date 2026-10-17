/* global document:readonly, window:readonly, URL:readonly */
import { BasePage } from './BasePage.js';
export class RestfulBookerBookingPage extends BasePage {
  constructor(page) {
    super(page);

    this.bookingCard = page.locator('.booking-card');
    this.checkIn = this.bookingCard.locator('input').nth(0);
    this.checkOut = this.bookingCard.locator('input').nth(1);
    this.bookingLinks = page.locator('.room-card').getByRole('link', { name: 'Book now' });
    this.checkAvailabilityButton = page.getByRole('button', { name: 'Check Availability' });
    this.firstName = page.getByRole('textbox', { name: 'Firstname' });
    this.lastName = page.getByRole('textbox', { name: 'Lastname' });
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.phone = page.getByRole('textbox', { name: 'Phone' });
    this.reserveButton = page.getByRole('button', { name: 'Reserve Now' });
  }

  async open() {
    await this.page.goto('https://automationintesting.online/');
  }

  async selectDates(checkInDate, checkOutDate) {
    await this.checkIn.click();
    await this.selectCalendarDate(checkInDate);
    await this.checkOut.click();
    await this.selectCalendarDate(checkOutDate);
  }

  async selectCalendarDate(date) {
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    const weekday = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(parsedDate);

    const day = parsedDate.getUTCDate();
    const month = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      timeZone: 'UTC',
    }).format(parsedDate);

    const year = parsedDate.getUTCFullYear();
    const accessibleName = `Choose ${weekday}, ${day} ${month} ${year}`;
    await this.page.getByRole('gridcell', { name: accessibleName }).click();
  }

  async checkAvailability() {
    await this.checkAvailabilityButton.click();
  }

  async getDisplayedDates() {
    return {
      checkin: await this.checkIn.inputValue(),
      checkout: await this.checkOut.inputValue(),
    };
  }

  async waitForAvailabilityResults(expectedRooms, dates = {}) {
    await this.page.waitForFunction(({ roomIds, checkin, checkout }) => {
      const roomsSection = document.querySelector('#rooms');
      const bookingLinks = Array.from(document.querySelectorAll('#rooms .room-card a'));
      const renderedBookings = bookingLinks.map((link) => {
        const href = link.getAttribute('href') || '';
        const url = new URL(href, window.location.origin);
        return {
          roomId: Number(url.pathname.split('/').pop()),
          checkin: url.searchParams.get('checkin'),
          checkout: url.searchParams.get('checkout'),
        };
      });
      const expectedIds = new Set(roomIds);
      const renderedIds = new Set(renderedBookings.map(({ roomId }) => roomId));

      return (
        roomsSection &&
        window.scrollY > 0 &&
        roomsSection.getBoundingClientRect().top < 1 &&
        renderedBookings.length === roomIds.length &&
        renderedIds.size === expectedIds.size &&
        [...expectedIds].every((roomId) => renderedIds.has(roomId)) &&
        renderedBookings.every(({ checkin: linkCheckin, checkout: linkCheckout }) =>
          (checkin === undefined || linkCheckin === checkin) &&
          (checkout === undefined || linkCheckout === checkout),
        )
      );
    }, { roomIds: expectedRooms, ...dates });
  }

  async getBookingLinkUrls() {
    return this.bookingLinks.evaluateAll((links) => links.map((link) => link.href));
  }

  async selectRoomById(roomId) {
    await this.page.locator(`#rooms .room-card a[href^="/reservation/${roomId}?"]`).click();
  }

  async startReservation() {
    await this.reserveButton.click();
  }

  async enterGuestDetails({ firstName, lastName, email, phone }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.email.fill(email);
    await this.phone.fill(phone);
  }

  async reserve() {
    await this.reserveButton.click();
  }
}
