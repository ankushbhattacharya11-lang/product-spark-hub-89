"""Automated accessibility audit (axe-core + Playwright).

Run: python3 scripts/a11y-audit.py    (dev server must be on :8080)

Audits the homepage and every /work/* case study in BOTH light and dark
themes. Fails on any serious/critical violation (ARIA, contrast, labels,
keyboard focusability). Reports moderate/minor findings without failing.
Also checks that keyboard Tab order reaches the skip link first.
"""

import asyncio
import json
import re
import sys
import urllib.request
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".a11y-reports"
AXE_URL = "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js"
AXE_CACHE = OUT / "axe.min.js"
FAIL_LEVELS = {"serious", "critical"}
THEME_KEY = "portfolio-theme"


def slugs() -> list[str]:
    data = (ROOT / "src/data/projects.ts").read_text()
    return re.findall(r'slug:\s*"([^"]+)"', data)


def axe_source() -> str:
    if not AXE_CACHE.exists():
        AXE_CACHE.write_bytes(urllib.request.urlopen(AXE_URL, timeout=60).read())
    return AXE_CACHE.read_text()


async def audit(page, url: str, theme: str, axe_js: str) -> list[dict]:
    await page.goto(url, wait_until="domcontentloaded")
    await page.evaluate(
        "([k, t]) => { localStorage.setItem(k, t); "
        "document.documentElement.classList.toggle('dark', t === 'dark'); "
        "document.documentElement.style.colorScheme = t; }",
        [THEME_KEY, theme],
    )
    await page.wait_for_load_state("networkidle")
    await page.add_script_tag(content=axe_js)
    result = await page.evaluate(
        "async () => await window.axe.run(document, { resultTypes: ['violations'], "
        "runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } })"
    )
    return result["violations"]


async def keyboard_check(page, url: str) -> list[str]:
    problems: list[str] = []
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle")
    await page.keyboard.press("Tab")
    first = await page.evaluate(
        "() => { const a = document.activeElement; return a ? (a.textContent || '').trim() : ''; }"
    )
    if "skip" not in first.lower():
        problems.append(f"{url}: first Tab stop is {first!r}, expected a skip link")

    reached = set()
    for _ in range(60):
        await page.keyboard.press("Tab")
        tag = await page.evaluate("() => document.activeElement?.tagName ?? ''")
        reached.add(tag)
    if not {"A", "BUTTON", "INPUT"} & reached:
        problems.append(f"{url}: keyboard tabbing never reached an interactive control")
    return problems


async def main() -> int:
    OUT.mkdir(exist_ok=True)
    axe_js = axe_source()
    urls = [f"{BASE}/"] + [f"{BASE}/work/{s}" for s in slugs()]
    failures: list[str] = []
    notes: list[str] = []
    report: dict[str, dict] = {}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()

        for url in urls:
            for theme in ("light", "dark"):
                violations = await audit(page, url, theme, axe_js)
                report[f"{url} [{theme}]"] = violations
                for v in violations:
                    line = (
                        f"{url} [{theme}] {v['impact']}: {v['id']} — {v['help']} "
                        f"({len(v['nodes'])} node(s); e.g. {v['nodes'][0]['target']})"
                    )
                    (failures if v["impact"] in FAIL_LEVELS else notes).append(line)
                print(f"audited {url} [{theme}] -> {len(violations)} violation(s)")

        failures += await keyboard_check(page, f"{BASE}/")
        failures += await keyboard_check(page, urls[1])
        await browser.close()

    (OUT / "axe-report.json").write_text(json.dumps(report, indent=2))

    if notes:
        print("\nAdvisory (moderate/minor):", *notes, sep="\n  ")
    if failures:
        print("\nFAILED (serious/critical):", *failures, sep="\n  ")
        return 1
    print("\nNo serious or critical accessibility violations found.")
    return 0


sys.exit(asyncio.run(main()))
