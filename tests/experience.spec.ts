import { test, expect } from "@playwright/test";

test("the Véloré wordmark opens once, can be skipped, and stays out of the way on refresh", async ({
  page,
}) => {
  await page.goto("/");
  const intro = page.locator(".brand-intro");
  await expect(intro).toHaveAttribute("data-phase", "showing");
  await expect(intro.locator(".brand-intro-mark")).toHaveAttribute(
    "src",
    "/images/emblem-mark.webp",
  );
  await expect(intro.locator(".brand-intro-name")).toHaveText("VÉLORÉ");
  await page
    .getByRole("button", { name: "Skip the Véloré introduction" })
    .click();
  await expect(intro).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".brand-intro")).toHaveCount(0);
});

test("direct anatomy links and reduced-motion visits do not wait for the intro", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/anatomy");
  await expect(page.locator(".brand-intro")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anatomy of a feeling.",
  );
  await expect(page.locator(".anatomy-scroll")).toHaveClass(/is-static/);
});

test("the Auren single-view illustration follows pointer and keyboard input without geometric distortion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Skip the Véloré introduction" })
    .click();
  const view = page.locator(".vehicle-view");
  const plane = page.locator(".vehicle-image-plane");
  const poseX = () =>
    plane.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue("--pose-x")),
    );
  await view.scrollIntoViewIfNeeded();
  await expect(view).toHaveAttribute(
    "aria-label",
    /single-view illustration, not a 360-degree model/i,
  );

  const bounds = (await view.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.92,
    bounds.y + bounds.height * 0.4,
    { steps: 8 },
  );
  await expect.poll(poseX).not.toBe(0);
  await page.screenshot({ path: "test-results/vehicle-study.png" });

  const matrix = await plane.evaluate((el) => {
    const transform = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return {
      a: transform.a,
      b: transform.b,
      c: transform.c,
      d: transform.d,
      x: transform.e,
    };
  });
  expect(matrix.a).toBeCloseTo(1);
  expect(matrix.b).toBeCloseTo(0);
  expect(matrix.c).toBeCloseTo(0);
  expect(matrix.d).toBeCloseTo(1);
  expect(Math.abs(matrix.x)).toBeGreaterThan(0);

  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
    { steps: 6 },
  );
  await expect.poll(poseX).toBe(0);

  await view.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(poseX).not.toBe(0);
  await page.getByRole("button", { name: /Return to centre/ }).click();
  await expect.poll(poseX).toBe(0);
});

test("horizontal touch-drag moves the full illustration while the page keeps vertical scroll", async ({
  browser,
}) => {
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  const view = page.locator(".vehicle-view");
  const plane = page.locator(".vehicle-image-plane");
  await view.scrollIntoViewIfNeeded();
  await expect(view).toHaveCSS("touch-action", "pan-y");

  await view.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const startX = bounds.left + bounds.width * 0.4;
    const endX = bounds.left + bounds.width * 0.78;
    const y = bounds.top + bounds.height * 0.5;
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 7,
      pointerType: "touch",
      clientY: y,
    };
    element.dispatchEvent(
      new PointerEvent("pointerdown", { ...init, clientX: startX }),
    );
    element.dispatchEvent(
      new PointerEvent("pointermove", { ...init, clientX: endX }),
    );
    element.dispatchEvent(
      new PointerEvent("pointerup", { ...init, clientX: endX }),
    );
  });
  await expect
    .poll(() =>
      plane.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).getPropertyValue("--pose-x")),
      ),
    )
    .not.toBe(0);
  await context.close();
});

test("the Auren inspection remains still for reduced-motion users", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const view = page.locator(".vehicle-view");
  const plane = page.locator(".vehicle-image-plane");
  await view.scrollIntoViewIfNeeded();
  const bounds = (await view.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.9,
    bounds.y + bounds.height / 2,
  );
  await expect(plane).toHaveCSS("transform", "none");
  await expect(plane).toHaveCSS("will-change", "auto");
  await expect(view).not.toHaveAttribute("tabindex", "0");
  await expect(page.locator(".vehicle-study-gesture")).toHaveText(
    /STATIC STUDY · MOVEMENT PAUSED/,
  );
  await expect(page.locator(".vehicle-study-instructions button")).toHaveCount(
    0,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(view).toHaveAttribute("tabindex", "0");
  await expect(page.locator(".vehicle-study-instructions button")).toHaveCount(
    1,
  );
});

test("the final technical illustration scrubs forward and reverses with native scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/anatomy");
  await page
    .getByRole("button", { name: "Skip the Véloré introduction" })
    .click();
  const root = page.locator(".anatomy-scroll");
  const seekWithDocumentScroll = async (progress: number) => {
    await page.evaluate((value) => {
      const section = document.querySelector<HTMLElement>(".anatomy-scroll")!;
      const table = document.querySelector<HTMLElement>(".anatomy-stage")!;
      const start = section.getBoundingClientRect().top + scrollY - 72;
      const travel = Math.max(1, section.offsetHeight - table.offsetHeight);
      window.scrollTo({
        top: start + (travel * value) / 100,
        behavior: "instant",
      });
    }, progress);
    await page.waitForFunction(
      (value) => {
        const state = Number(
          document.querySelector<HTMLElement>(".anatomy-stage")?.dataset
            .progress,
        );
        return Math.abs(state - value / 100) < 0.005;
      },
      progress,
      { timeout: 10_000 },
    );
  };

  await expect(root).toHaveClass(/anatomy-scroll/);
  await seekWithDocumentScroll(100);
  const exploded = await page
    .locator('[data-part="coachwork"]')
    .evaluate((el) => (el as HTMLElement).style.transform);
  expect(exploded).not.toContain("0.00px, 0.00px, 0px");

  await seekWithDocumentScroll(0);
  await expect(page.locator(".draft-progress strong")).toHaveText("000");
  const assembled = await page
    .locator('[data-part="coachwork"]')
    .evaluate((el) => (el as HTMLElement).style.transform);
  expect(assembled).toContain("translate3d(0px, 0px, 0px)");
});
