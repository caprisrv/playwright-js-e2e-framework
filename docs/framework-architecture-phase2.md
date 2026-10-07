# Playwright JavaScript E2E Framework — Phase 2 Architecture

## Phase 2 — Advanced E2E Framework

Phase 2 extends the deterministic Playwright E2E framework with API-assisted UI workflows.

The objective is **not** to build a separate API automation framework. APIs are introduced where they improve the reliability, speed, setup, verification, or cleanup of UI business journeys.

---

## 1. Phase 2 Objective

Phase 2 introduces the ability for a UI E2E test to combine:

- Playwright UI automation
- API authentication
- API verification
- API cleanup
- Secure API credentials
- UI and API responsibilities separated into appropriate framework components

The target architecture is:

```text
                    BUSINESS E2E TEST
                           |
             +-------------+-------------+
             |                           |
             v                           v
        Page Object                 API Client
             |                           |
             v                           v
          UI Layer                  API Layer
             |                           |
             +-------------+-------------+
                           |
                           v
                    Test Assertions
                           |
                           v
                 Deterministic Result