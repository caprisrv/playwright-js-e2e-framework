# Test Plan — RB-123: Customer Can Book an Available Room

## 1. Document Information

- Story ID: RB-123
- Story Understanding: story-understanding.md
- Status: Draft — pending review
- Strategy: Hybrid (end-to-end + focused tests)
- Automation Framework: Playwright JavaScript
- Application: Restful Booker
- Test Plan Version: 1.0

## 2. Objective

Verify that a customer can book an available room for selected
dates, provide the required guest information, submit a
reservation, and see a booking confirmation.

All scenarios must trace back to the acceptance criteria
in story-understanding.md.

## 3. Scope

### In Scope

- Selecting check-in and check-out dates.
- Viewing available rooms for selected dates.
- Selecting an available room.
- Providing required guest information.
- Submitting a reservation.
- Displaying booking confirmation after successful reservation.

### Not Yet in Scope

The following behaviors require additional requirements
or clarification before they become mandatory tests:

- Invalid date handling.
- Booking when no rooms are available.
- Missing or invalid guest information.
- Payment validation.
- Pricing, taxes, and promotional codes.
- Confirmation-number delivery.
- Network and dependent-service failures.
- Typed date entry as a required interaction method.

## 4. Test Strategy

Use a hybrid strategy.

### Layer 1: End-to-End Coverage

Verify the complete successful booking journey in one test.

This demonstrates that the principal customer workflow works
across the relevant application components.

### Layer 2: Focused Coverage

Use focused tests for important behaviors when they provide
additional coverage or make failures easier to diagnose.

Do not create separate tests for every UI action automatically.

### Layer 3: Future Negative Scenarios

Add negative tests only after their expected behavior is
supported by requirements or approved clarification.

## 5. Test Scenarios

### TC-001: Customer Successfully Books an Available Room

**Type:** End-to-end

**Priority:** P1

**Acceptance Criteria:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-6

**Preconditions:**
- The customer can access the booking functionality.
- At least one room is available for the selected dates.
- Suitable test dates and guest information are available.

**Test Steps:**
1. Open the booking application.
2. Select check-in and check-out dates.
3. View available rooms for those dates.
4. Select an available room.
5. Provide the required guest information.
6. Submit the reservation.

**Expected Results:**
- The customer can select the dates.
- Available rooms are displayed.
- The customer can select a room.
- The customer can provide the required guest information.
- The reservation can be submitted.
- A successful reservation displays a booking confirmation.

**Traceability:** RB-123 → AC-1 through AC-6

**Status:** Implemented; execution not validated

---

### TC-002: Customer Selects Check-In and Check-Out Dates

**Type:** Focused

**Priority:** P1

**Acceptance Criteria:** AC-1

**Preconditions:**
- The customer can access the booking functionality.

**Test Steps:**
1. Open the booking application.
2. Select a check-in date.
3. Select a check-out date.

**Expected Results:**
- The customer can select both dates.
- The selected dates are reflected in the booking interface.

**Traceability:** RB-123 → AC-1

**Status:** Planned

**Note:** Calendar selection is the initial proposed interaction.
Typed date entry is not mandatory unless the requirement
is clarified.

---

### TC-003: Customer Views Available Rooms

**Type:** Focused

**Priority:** P1

**Acceptance Criteria:** AC-2

**Preconditions:**
- The customer can access the booking functionality.
- At least one room is available for the selected dates.

**Test Steps:**
1. Select check-in and check-out dates.
2. Request room availability.

**Expected Results:**
- The application displays available rooms for the selected dates.

**Traceability:** RB-123 → AC-2

**Status:** Planned

---

### TC-004: Customer Selects an Available Room

**Type:** Focused

**Priority:** P1

**Acceptance Criteria:** AC-3

**Preconditions:**
- Available rooms are displayed.

**Test Steps:**
1. Identify an available room.
2. Select that room.

**Expected Results:**
- The customer can select the available room and proceed
  with the booking journey.

**Traceability:** RB-123 → AC-3

**Status:** Planned

---

### TC-005: Customer Provides Required Guest Information

**Type:** Focused

**Priority:** P1

**Acceptance Criteria:** AC-4

**Preconditions:**
- The customer has selected an available room.
- The application is ready to accept guest information.

**Test Steps:**
1. Navigate to the guest-information portion of the booking.
2. Enter the required guest information.

**Expected Results:**
- The customer can provide the required guest information.

**Traceability:** RB-123 → AC-4

**Status:** Planned

**Note:** The required fields and validation rules must be
confirmed before detailed test data is finalized.

---

## 6. End-to-End Assertion Boundaries

TC-001 covers the complete booking journey.

The test should verify the business outcomes required by
the acceptance criteria rather than asserting implementation
details unnecessarily.

Where appropriate, backend API evidence may be used to verify
reservation state, provided it does not replace verification
of the customer-facing journey.

TC-001 checks the displayed dates, confirms a successful availability
response with at least one room, waits for the response's room IDs and
booking links to render, then selects a room identified by that response.
It verifies the created booking through the booking API and checks the
customer-facing confirmation. These are implementation assertions for
the end-to-end scenario, not additions to the business requirements.

## 7. Test Data

The following data is used by the implemented TC-001 or must be prepared
for the remaining planned cases:

- Check-in date.
- Check-out date.
- An available room.
- Required guest information.

The test must use controlled data suitable for the test
environment.

TC-001 currently selects October 11–12, 2026 with the browser clock fixed
at October 10, 2026 in America/Phoenix. The booking journey uses guest
details supplied by the test and authenticates before reservation
submission so an authentication failure cannot create an uncleaned booking.
It deletes the created booking after verification even when assertions fail;
a cleanup error is retained alongside an existing test error. The story does not define date rules,
required guest fields, or cleanup requirements.

### Recorded application exploration

The diagnostic test was run and its terminal output showed displayed dates
`20/10/2026` and `22/10/2026`, `/api/room` query values `2026-10-21` and
`2026-10-23`, and booking-link query values `2026-10-20` and `2026-10-22`
in America/Phoenix with the diagnostic's fixed clock. This is a runtime
observation only. The API's formal date contract and the deployed source
revision remain unconfirmed; no expected API date pair is established here.

## 8. Test Independence and Cleanup

Each scenario should be designed to avoid depending on the
execution order of another test.

TC-001 authenticates before creating a reservation and deletes the created
booking after the API verification and confirmation assertions. Cleanup is
attempted even if those assertions fail. This behavior is implemented but
still requires successful browser execution validation.

## 9. Traceability Matrix

| Acceptance Criterion | Test Coverage |
|---|---|
| AC-1: Select check-in and check-out dates | TC-001, TC-002 |
| AC-2: View available rooms | TC-001, TC-003 |
| AC-3: Select an available room | TC-001, TC-004 |
| AC-4: Provide required guest information | TC-001, TC-005 |
| AC-5: Submit reservation | TC-001 |
| AC-6: Display booking confirmation | TC-001 |

The matrix records planned coverage. Implementation and successful
execution are tracked separately in Current Status.

## 10. Open Questions

- Must typed date entry be supported?
- What date-validation rules apply?
- Which guest-information fields are mandatory?
- What should happen when no rooms are available?
- What should happen when reservation submission fails?
- What information must booking confirmation contain?
- Are payment and pricing part of this story or separate stories?
- What cleanup method is appropriate for test reservations?

## 11. Approval Criteria

Before automation generation:

- [ ] Every acceptance criterion has planned coverage.
- [ ] Test scenarios are traceable to acceptance criteria.
- [ ] Unsupported assumptions remain explicitly identified.
- [ ] Required test data can be prepared.
- [ ] Expected outcomes are sufficiently clear.
- [ ] Test independence and cleanup have been considered.
- [ ] The plan has been reviewed and approved.

## 12. Current Status

- Test scenarios proposed: 5
- End-to-end scenarios: 1
- Focused scenarios: 4
- Acceptance criteria mapped: 6 of 6
- TC-001 implementation: Present in `tests/restfulbooker/booking.spec.js`
- TC-001 execution validation: Blocked; Chromium launch failed before the test body
- Execution-validated scenarios: 0
- Diagnostic date exploration: Runtime values recorded above; API contract unconfirmed
- Remaining focused scenarios: TC-002 through TC-005 planned; TC-006 requires clarification
- Approval status: Draft
