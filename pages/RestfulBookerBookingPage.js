import { BasePage } from './BasePage.js';
export class RestfulBookerBookingPage extends BasePage {
  constructor(page) {
    super(page);

    this.bookingCard = page.locator('.booking-card');
    this.checkIn = this.bookingCard.locator('input').nth(0);
    this.checkOut = this.bookingCard.locator('input').nth(1);
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

  async selectRoom(roomName) {
    const roomCard = this.page.locator('.room-card').filter({ hasText: roomName });
    await roomCard.getByRole('link', { name: 'Book now' }).click();
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
