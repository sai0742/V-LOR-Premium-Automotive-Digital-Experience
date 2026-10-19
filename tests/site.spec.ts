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
