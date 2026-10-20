import { test, expect, type Page } from "@playwright/test";

// The bundled Linux browser renders 3D with software SwiftShader. Wait for
// the actual timeline state rather than imposing a hardware-GPU frame budget.
test.setTimeout(45_000);

async function scrub(page: Page, value: number) {
  await expect(page.locator(".anatomy-stage")).toHaveAttribute(
    "data-progress",
    /[0-9.]+/,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((percent) => {
    const root = document.querySelector<HTMLElement>(".anatomy-scroll")!;
    const stage = document.querySelector<HTMLElement>(".anatomy-stage")!;
    window.scrollTo({
      top:
        root.getBoundingClientRect().top +
        scrollY -
        72 +
        ((root.offsetHeight - stage.offsetHeight) * percent) / 100,
      behavior: "instant",
    });
  }, value);
  await page.waitForFunction(
    (percent) => {
      const value =
        document.querySelector<HTMLElement>(".anatomy-stage")?.dataset.progress;
      return (
        value !== undefined && Math.abs(Number(value) - percent / 100) < 0.005
      );
    },
    value,
    { timeout: 10_000 },
  );
}

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`atelier renders assembled and exploded at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/anatomy");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Anatomy of a feeling.",
    );
    await expect(page.locator(".navlinks a[aria-current=page]")).toHaveText(
      /Anatomy/,
    );
    await expect(page.locator(".blueprint-layer")).toHaveCount(5);
    expect(
      await page
        .locator(".anatomy-scroll")
        .evaluate((el) => el.clientHeight / innerHeight),
    ).toBeCloseTo(4, 1);
    await page.screenshot({
      path: `test-results/atelier-assembled-${width}.png`,
    });
    const before = await page
      .locator(".anatomy-scene")
      .evaluate((el) => (el as HTMLElement).style.transform);
    await scrub(page, 100);
    await expect(
      page.getByRole("slider", { name: "Disassembly progress" }),
    ).toHaveValue("100");
    const transforms = await page
      .locator(".blueprint-layer")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).style.transform),
      );
    expect(new Set(transforms).size).toBe(5);
    expect(
      await page
        .locator(".anatomy-scene")
        .evaluate((el) => (el as HTMLElement).style.transform),
    ).not.toBe(before);
    expect(
      await page
        .locator(".blueprint-leaders path")
        .evaluateAll((els) =>
          els.every(
            (el) =>
              (el as SVGPathElement).style.strokeDashoffset === "0" ||
              Number((el as SVGPathElement).style.strokeDashoffset) === 0,
          ),
        ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Exploded", exact: true }),
    ).toBeInViewport();
    for (const callout of await page.locator(".assembly-callout").all())
      await expect(callout).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await page.mouse.move(3, 3);
    await page.screenshot({
      path: `test-results/atelier-exploded-${width}.png`,
    });
  });
}

test("Sheet 07 peels, unfolds into the atelier and returns to the notebook", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const portal = page.getByRole("link", {
    name: "Explore Technical Disassembly",
    exact: true,
  });
  await portal.scrollIntoViewIfNeeded();
  await portal.hover();
  await expect(portal.locator(".notebook-portal-badge")).toBeVisible();
  await expect
    .poll(() =>
      portal.locator(".tape").evaluate((el) => getComputedStyle(el).transform),
    )
    .toContain("matrix3d");
  await page.screenshot({ path: "test-results/notebook-portal.png" });
  await portal.click();
  await expect(page.locator(".paper-transition")).toBeVisible();
  await expect(page).toHaveURL(/\/anatomy$/);
  await expect(page.locator(".paper-transition")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page).toHaveTitle("The Anatomy Atelier — VÉLORÉ");
  await page.getByRole("link", { name: "Back to the notebook" }).click();
  await expect(page).toHaveURL(/\/#journal$/);
  await expect(page.locator(".paper-transition")).toHaveCount(0);
  await expect(portal).toBeInViewport();
});

test("scrubber, assembly inspection and reset operate with the keyboard", async ({
  page,
}) => {
  await page.goto("/anatomy");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".anatomy-stage")).toHaveAttribute(
    "data-progress",
    /[0-9.]+/,
  );
  const range = page.getByRole("slider", { name: "Disassembly progress" });
  await range.focus();
  await page.keyboard.press("End");
  await expect(range).toHaveValue("100", { timeout: 10_000 });
  const label = page.locator('[data-callout="powertrain"]');
  await label.focus();
  await page.keyboard.press("Enter");
  await expect(label).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-part="powertrain"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#assembly-insight")).toContainText(
    "Twelve cylinders",
  );
  await page.getByRole("button", { name: "Show all assemblies" }).click();
  await expect(label).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Assembled", exact: true }).click();
  await expect(range).toHaveValue("0", { timeout: 10_000 });
  await page.getByRole("button", { name: "Exploded", exact: true }).click();
  await expect(range).toHaveValue("100", { timeout: 10_000 });
});

test("leaders are attached to transformed SVG anchors throughout the scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/anatomy");
  await scrub(page, 28);
  const partial = Number(
    await page
      .locator('[data-leader="coachwork"]')
      .evaluate((el) => (el as SVGPathElement).style.strokeDashoffset),
  );
  expect(partial).toBeGreaterThan(0);
  expect(partial).toBeLessThan(1);
  expect(
    await page
      .locator(".draft-grid")
      .evaluate((el) => (el as HTMLElement).style.transform),
  ).not.toBe("translate3d(0px, 0px, 0px)");
  await scrub(page, 65);
  // Each leader must end exactly on the projected 3D anchor that positions its
  // numbered marker, measured against the same transform written that frame.
  const error = await page.evaluate(() => {
    return [...document.querySelectorAll<SVGPathElement>("[data-leader]")].map(
      (path) => {
        const point = path.getPointAtLength(path.getTotalLength());
        const layer = document.querySelector<HTMLElement>(
          `[data-part="${path.dataset.leader}"]`,
        )!;
        return Math.hypot(
          point.x - Number(layer.dataset.anchorX),
          point.y - Number(layer.dataset.anchorY),
        );
      },
    );
  });
  expect(Math.max(...error)).toBeLessThan(0.2);
  const viewport = await page.evaluate(() => {
    const table = document
      .querySelector(".anatomy-stage")!
      .getBoundingClientRect();
    return [
      ...document.querySelectorAll<HTMLElement>(
        ".anatomy-scene .blueprint-layer",
      ),
    ].every((layer) => {
      const box = layer.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      return (
        x > table.left && x < table.right && y > table.top && y < table.bottom
      );
    });
  });
  expect(viewport).toBe(true);
  const first = await page
    .locator('[data-leader="coachwork"]')
    .getAttribute("d");
  await scrub(page, 90);
  expect(
    await page.locator('[data-leader="coachwork"]').getAttribute("d"),
  ).not.toBe(first);
});

test("the drafting cursor reports coordinates and morphs into a loupe on artwork", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const frame = page.locator(".hero-art .art-frame");
  await frame.hover({ position: { x: 100, y: 70 } });
  await expect(page.locator(".cursor")).toHaveClass(/is-loupe/);
  await expect(page.locator(".cursor-coordinates")).toHaveText(
    /X \d{4}\nY \d{4}/,
  );
  await expect
    .poll(() =>
      frame
        .locator(".art-sketch")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeLessThan(0.05);
  expect(
    await frame.evaluate((el) =>
      (el as HTMLElement).style.getPropertyValue("--ax"),
    ),
  ).not.toBe("0.000");
  await page.mouse.move(10, 200);
  await expect(page.locator(".cursor")).not.toHaveClass(/is-loupe/);
  await expect
    .poll(() =>
      frame.evaluate((el) =>
        (el as HTMLElement).style.getPropertyValue("--ax"),
      ),
    )
    .toBe("0");
  await expect
    .poll(() =>
      frame
        .locator(".art-sketch")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.45);
});

test("direct links, reload, back/forward and cross-route anchors stay coherent", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .locator("#main-navigation")
    .getByRole("link", { name: /Anatomy/ })
    .click();
  await expect(page).toHaveURL(/\/anatomy$/);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anatomy",
  );
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Long Way.",
  );
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anatomy",
  );
  await page
    .locator("#main-navigation")
    .getByRole("link", { name: "Craftsmanship" })
    .click();
  await expect(page).toHaveURL(/\/#craftsmanship$/);
  await expect(
    page.getByRole("heading", { name: "Made to be felt. Not just admired." }),
  ).toBeInViewport();
  await expect(page.locator(".paper-transition")).toHaveCount(0);
});

test("reduced motion shows a static, complete drawing and instant controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/anatomy");
  await expect(page.locator(".anatomy-scroll")).toHaveClass(/is-static/);
  await expect(page.getByRole("slider")).toHaveValue("100");
  expect(
    await page
      .locator(".anatomy-scroll")
      .evaluate((el) => el.clientHeight / innerHeight),
  ).toBeLessThan(2);
  expect(
    await page
      .locator(".anatomy-scene")
      .evaluate((el) => (el as HTMLElement).style.transform),
  ).not.toMatch(/rotate/);
  await page.mouse.move(500, 400);
  await expect(page.locator(".cursor")).toBeHidden();
  await page.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("slider")).toHaveValue("0");
  await page.getByRole("button", { name: "Exploded", exact: true }).click();
  await expect(page.getByRole("slider")).toHaveValue("100");
  await expect(page.locator(".anatomy-note")).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".anatomy-scroll")).not.toHaveClass(/is-static/);
});

test("italic words settle in with a locally hosted variable font", async ({
  page,
}) => {
  await page.goto("/");
  const note = page.locator(".notebook-art .handnote");
  await note.scrollIntoViewIfNeeded();
  await expect(note).toHaveClass(/ink-visible/);
  expect(
    await note.evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Cormorant Garamond Variable");
  expect(await note.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "ink-settle",
  );
});

test.describe("touch atelier", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("the portal is discoverable without hover and parts work by tap", async ({
    page,
  }) => {
    await page.goto("/");
    const portal = page.getByRole("link", {
      name: "Explore Technical Disassembly",
      exact: true,
    });
    await portal.scrollIntoViewIfNeeded();
    await expect(portal.locator(".notebook-portal-badge")).toBeVisible();
    await portal.tap();
    await expect(page).toHaveURL(/\/anatomy$/);
    await expect(page.locator(".paper-transition")).toHaveCount(0);
    await scrub(page, 100);
    await page.locator('[data-callout="cockpit"]').tap();
    await expect(page.locator("#assembly-insight")).toContainText(
      "The part you become a part of",
    );
    await expect(page.locator(".cursor")).toBeHidden();
    await page.getByRole("button", { name: "Show all assemblies" }).tap();
    await page.screenshot({ path: "test-results/atelier-touch-390.png" });
    await page.locator(".menu-toggle").tap();
    await page
      .locator("#main-navigation")
      .getByRole("link", { name: "Journal" })
      .tap();
    await expect(page).toHaveURL(/\/#journal$/);
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

test("the drawing itself supports loupe hover and direct part selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/anatomy");
  await scrub(page, 100);
  const box = (await page
    .locator('.anatomy-scene [data-anchor="powertrain"]')
    .boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator(".cursor")).toHaveClass(/is-loupe/);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('[data-part="powertrain"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#assembly-insight")).toContainText(
    "Twelve cylinders",
  );
});

test("short landscape screens get an unpinned, manually explorable sheet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/anatomy");
  await expect(page.locator(".anatomy-scroll")).toHaveClass(/is-static/);
  await expect(page.getByRole("slider")).toHaveValue("100");
  await page.getByRole("slider").scrollIntoViewIfNeeded();
  await page.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("slider")).toHaveValue("0");
  await page.getByRole("button", { name: "Exploded", exact: true }).click();
  await expect(page.getByRole("slider")).toHaveValue("100");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
