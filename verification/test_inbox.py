import pytest
from playwright.sync_api import Page, expect

def test_sp_inbox(page: Page):
    # This test assumes the app is running and seeded

    # Login
    page.goto("http://localhost:5173/sp/login")
    page.fill("input[name='email']", "test@sp.com")
    page.fill("input[name='password']", "password")
    page.click("button[type='submit']")

    # Wait for dashboard
    expect(page.locator("text=SP Admin")).to_be_visible()

    # Click Inbox tab
    page.click("button:has-text('Inbox')")

    # Check for Inbox header
    expect(page.locator("h1:has-text('Inbox')")).to_be_visible()

    # Check for empty state or list
    # If empty:
    # expect(page.locator("text=No notifications yet")).to_be_visible()
