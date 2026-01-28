from playwright.sync_api import Page, expect, sync_playwright
import time

def test_submit_quote_flow(page: Page):
    # Mock Auth Me
    page.route("**/api/auth/sp/me", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"id": "sp-1", "name": "Plumber Joe", "email": "joe@plumber.com", "status": "ACTIVE"}'
    ))

    # Mock Available Projects
    page.route("**/api/sp/available-projects", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "newRequests": [
                {
                    "id": "req-1",
                    "description": "Fix leaking faucet",
                    "requiredTrades": ["Plumber"],
                    "status": "PENDING",
                    "latitude": 40.7,
                    "longitude": -74.0,
                    "user": {"name": "Anonymous User"}
                }
            ],
            "sentQuotes": [],
            "acceptedJobs": []
        }'''
    ))

    # Mock Submit Quote
    page.route("**/api/quotes/submit", lambda route: route.fulfill(
        status=201,
        content_type="application/json",
        body='{"message": "Quote submitted successfully", "quote": {"id": "q-1"}}'
    ))

    # Set Token
    page.context.add_init_script("localStorage.setItem('token', 'fake-jwt-token');")

    # Go to Dashboard
    page.goto("http://localhost:3000/admin")

    # Wait for dashboard to load
    expect(page.locator("h1").filter(has_text="Job Requests")).to_be_visible()

    # Wait for requests to load
    expect(page.get_by_text("Fix leaking faucet")).to_be_visible()

    # Click Submit Quote
    page.get_by_role("button", name="Submit Quote").click()

    # Verify Form opens
    expect(page.locator("h2").filter(has_text="Submit Quote")).to_be_visible()
    expect(page.get_by_text("Request Details")).to_be_visible()

    # Screenshot Form
    page.screenshot(path="verification/quote_form_open.png")

    # Fill Form
    page.get_by_label("Bid Amount ($)").fill("150")
    page.get_by_label("Quote Details").fill("I will fix the faucet with premium parts.")

    # Submit
    page.locator("form").get_by_role("button", name="Submit Quote").click()

    # Verify Toast
    expect(page.get_by_text("Quote Submitted Successfully!")).to_be_visible()

    # Screenshot Success
    page.screenshot(path="verification/quote_submitted.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_submit_quote_flow(page)
            print("Verification script passed successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="/home/jules/verification/failure.png")
            raise e
        finally:
            browser.close()
