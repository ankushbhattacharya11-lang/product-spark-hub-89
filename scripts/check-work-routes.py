"""Visual regression check for /work/* case study routes.

Run: python3 scripts/check-work-routes.py   (dev server must be on :8080)
Fails if a case study route renders the homepage hero instead of its own hero.
"""
import asyncio, re, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
OUT = Path(__file__).resolve().parent.parent / ".visual-checks"

def slugs() -> list[str]:
    data = (Path(__file__).resolve().parent.parent / "src/data/projects.ts").read_text()
    return re.findall(r'slug:\s*"([^"]+)"', data)

async def main() -> int:
    OUT.mkdir(exist_ok=True)
    failures: list[str] = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()
        errors: list[str] = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        for slug in slugs():
            url = f"{BASE}/work/{slug}"
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path=str(OUT / f"work-{slug}.png"))

            h1s = await page.locator("h1").all_inner_texts()
            h1 = (h1s[0].strip() if h1s else "")
            if not h1:
                failures.append(f"{url}: empty hero (no h1 text)")
            elif "Digital Product Developer" in h1:
                failures.append(f"{url}: rendered the homepage hero instead of the case study")
            elif len(h1s) != 1:
                failures.append(f"{url}: expected a single h1, found {len(h1s)}")

            for label in ("Problem", "Approach", "Workflow", "Results", "Tech stack"):
                if await page.get_by_text(label, exact=True).count() == 0:
                    failures.append(f"{url}: missing '{label}' section")
            print(f"checked {url} -> h1={h1!r}")

        await page.goto(f"{BASE}/work/does-not-exist", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle")
        if await page.get_by_text("Case study not found").count() == 0:
            failures.append("/work/does-not-exist: missing not-found state")

        await browser.close()

    if errors:
        print("console errors:", *errors, sep="\n  ")
    if failures:
        print("\nFAILED:", *failures, sep="\n  ")
        return 1
    print("\nAll /work/* routes render their own hero and sections.")
    return 0

sys.exit(asyncio.run(main()))
