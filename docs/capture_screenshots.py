"""Take the screenshots the README uses.

    python3 docs/capture_screenshots.py

Both servers have to be up first: Django on 8001 and Vite on 5180. Every
image is written to docs/screenshots/, overwriting what was there.
"""

import asyncio
import pathlib
import sys

from playwright.async_api import async_playwright

APP = "http://localhost:5180"
OUT = pathlib.Path(__file__).resolve().parent / "screenshots"

DESKTOP = {"width": 1440, "height": 900}
PHONE = {"width": 390, "height": 844}

ADMIN = ("01700000000", "admin1234")
STUDENT = ("01700000002", "student1234")

problems = []


async def shot(page, name, full=False):
    await page.wait_for_timeout(700)
    await page.screenshot(path=str(OUT / f"{name}.png"), full_page=full)
    text = (await page.inner_text("body")).strip()
    mark = "ok " if text else "EMPTY"
    if not text:
        problems.append(name)
    print(f"  {mark} {name}.png")


async def log_in(page, phone, password):
    await page.goto(f"{APP}/login")
    await page.fill('input[name="phone_number"]', phone)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await page.wait_for_url(f"{APP}/", timeout=10_000)
    await page.wait_for_timeout(1200)


async def go(page, path, wait_for=None):
    await page.goto(f"{APP}{path}")
    if wait_for:
        await page.wait_for_selector(wait_for, timeout=10_000)
    await page.wait_for_timeout(1200)


async def main():
    OUT.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport=DESKTOP, device_scale_factor=2)
        page = await context.new_page()
        page.on("pageerror", lambda e: problems.append(f"JS error: {e}"))

        print("public pages")
        await page.goto(f"{APP}/login")
        await shot(page, "login")

        await go(page, "/forgot-password")
        await shot(page, "forgot-password")

        print("admin")
        await log_in(page, *ADMIN)
        await shot(page, "dashboard")

        await go(page, "/students", "table")
        await shot(page, "students")

        # The same table with the question narrowed: a search, a dropdown
        # filter and a sort at once, so the shot shows what the strip is for.
        # The term is one that matches enough rows to still need a pager.
        await page.fill('input[name="search"]', "rahman")
        await page.select_option('select[name="status"]', "true")
        await page.get_by_role("button", name="Name").click()
        await page.wait_for_timeout(1400)
        await shot(page, "students-filtered")

        await go(page, "/courses", "table")
        add = page.get_by_role("button", name="Add", exact=False).first
        await add.click()
        await page.wait_for_timeout(600)
        await shot(page, "courses-form")

        await go(page, "/teachers", "table")
        await page.get_by_label("Delete").first.click()
        await page.wait_for_timeout(500)
        await shot(page, "confirm-delete")
        await page.keyboard.press("Escape")

        await go(page, "/assignments", "table")
        await shot(page, "assignments")

        await go(page, "/submissions", "table")
        await shot(page, "submissions")

        await go(page, "/results", "table")
        await shot(page, "results")

        await go(page, "/enrollments", "table")
        await shot(page, "enrollments")

        await go(page, "/lessons", "table")
        await shot(page, "lessons")

        await go(page, "/accounts")
        await shot(page, "accounts")

        await go(page, "/profile")
        await shot(page, "profile")

        print("phone")
        phone_ctx = await browser.new_context(
            viewport=PHONE, device_scale_factor=3, is_mobile=True, has_touch=True,
        )
        small = await phone_ctx.new_page()
        await log_in(small, *ADMIN)
        await shot(small, "mobile-dashboard")
        await small.get_by_label("Open menu").click()
        await small.wait_for_timeout(600)
        await shot(small, "mobile-menu")
        await phone_ctx.close()

        print("student")
        student_ctx = await browser.new_context(viewport=DESKTOP, device_scale_factor=2)
        student = await student_ctx.new_page()
        await log_in(student, *STUDENT)
        await go(student, "/courses", "table")
        await shot(student, "student-view")
        await student_ctx.close()

        await browser.close()

    if problems:
        print("\nProblems:")
        for line in problems:
            print(f"  - {line}")
        return 1

    print(f"\nAll screenshots written to {OUT}")
    return 0


sys.exit(asyncio.run(main()))
