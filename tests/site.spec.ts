import { test, expect } from "@playwright/test";
for (const width of [1440, 1024, 768, 375, 320]) {
  test(`render and assets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toContainText("Long Way.");
    for (const section of await page.locator("main section").all()) {
      await section.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.every(
            (i) =>
              (i as HTMLImageElement).complete &&
              (i as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    ).toBeTruthy();
    expect(errors).toEqual([]);
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    if (width === 1440)
      await page.screenshot({
        path: "test-results/desktop-full.png",
        fullPage: true,
      });
  });
}
test("materials, registry validation, and anchor navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Metal", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Satin-finished aluminium" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Metal", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Join the registry" }).click();
  await expect(page.getByRole("alert")).toContainText("valid email");
  await page.getByLabel("Your email address").fill("visitor@example.com");
  await page.getByRole("button", { name: "Join the registry" }).click();
  await expect(page.locator("#form-feedback")).toContainText(
    "has not been sent, stored or subscribed",
  );
  await page.getByRole("link", { name: "Discover the Auren GT" }).click();
  await expect(page).toHaveURL(/#collection$/);
});
test("mobile menu keyboard focus, escape and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#main-navigation a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "Journal" })
    .click();
  await expect(page).toHaveURL(/#journal$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
test("reduced motion keeps all content available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  expect(
    await page
      .locator("html")
      .evaluate((e) => getComputedStyle(e).scrollBehavior),
  ).toBe("auto");
});
test("drafting compass cursor tracks the pointer and magnetizes CTAs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const cursor = page.locator(".cursor");
  await page.mouse.move(500, 400);
  await expect(cursor).toBeVisible();
  await expect(cursor.locator(".cursor-coordinates")).toHaveText(
    "X 0500\nY 0400",
  );
  expect(await cursor.locator(".cursor-dot, .cursor-ring").count()).toBe(2);
  expect(
    await page.evaluate(() => document.body.classList.contains("has-cursor")),
  ).toBe(true);
  await page.mouse.move(500, 400);
  const first = await cursor
    .locator(".cursor-dot")
    .evaluate((el) => el.style.transform);
  await page.mouse.move(720, 520, { steps: 6 });
  const second = await cursor
    .locator(".cursor-dot")
    .evaluate((el) => el.style.transform);
  expect(first).toMatch(/translate3d/);
  expect(second).not.toBe(first);
  const cta = page.locator(".nav-cta");
  const box = (await cta.boundingBox())!;
  // hover off-centre: at the exact middle the magnetic delta is zero
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height / 2, {
    steps: 8,
  });
  await expect(cursor).toHaveClass(/is-active/);
  await page.waitForFunction(() =>
    (
      document.querySelector(".nav-cta") as HTMLElement
    ).style.transform.includes("translate3d"),
  );
});
test("magnetic swatches ease back to rest when the pointer leaves", async ({
  page,
}) => {
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Metal", exact: true });
  await btn.scrollIntoViewIfNeeded();
  const box = (await btn.boundingBox())!;
  await page.mouse.move(box.x + 6, box.y + box.height / 2, { steps: 6 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLElement>("[data-magnetic]")].some(
      (el) => el.style.transform !== "",
    ),
  );
  await page.mouse.move(20, 200, { steps: 10 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLElement>("[data-magnetic]")].every(
      (el) => el.style.transform === "",
    ),
  );
});
test("touch devices keep the native cursor", async ({ browser }) => {
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
  ).toBe(true);
  expect(
    await page.evaluate(() => document.body.classList.contains("has-cursor")),
  ).toBe(false);
  await expect(page.locator(".cursor")).toBeHidden();
  await context.close();
});
test("reduced motion disables the magnetic cursor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.mouse.move(400, 400, { steps: 4 });
  expect(
    await page.evaluate(() => document.body.classList.contains("has-cursor")),
  ).toBe(false);
  await expect(page.locator(".cursor")).toBeHidden();
});
test("anchor targets clear the sticky nav and hero art blends", async ({
  page,
}) => {
  // instant (reduced-motion) scrolling: headless Chromium interrupts long
  // smooth fragment scrolls at arbitrary points, so the landing position is
  // only deterministic with scroll-behavior auto
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("#craftsmanship")
      .evaluate((el) => getComputedStyle(el).scrollMarginTop),
  ).toBe("100px");
  await page.getByRole("link", { name: "Craftsmanship" }).click();
  // with a 0 margin (pre-upgrade) the section top lands under the sticky nav
  // (~-16px); the 100px margin must keep it clear of the 72px scrolled nav
  const top = await page
    .locator("#craftsmanship")
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThan(72);
  expect(top).toBeLessThanOrEqual(250);
  expect(
    await page
      .locator(".hero-art > .art-frame")
      .evaluate((el) => getComputedStyle(el).mixBlendMode),
  ).toBe("multiply");
  expect(
    await page
      .locator(".hero-art")
      .evaluate((el) => getComputedStyle(el, "::after").mixBlendMode),
  ).toBe("soft-light");
});
